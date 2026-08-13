import {
  BlobAccessError,
  BlobClientTokenExpiredError,
  BlobError,
  BlobNotFoundError,
  BlobPreconditionFailedError,
  BlobStoreNotFoundError,
  BlobStoreSuspendedError,
  head,
  put,
} from "@vercel/blob";
import { teamsMock } from "../../public/camisetas/mock";
import { CATALOG_STATE_VERSION, createCatalogState, type CatalogState } from "@/lib/catalog";
import { isStateVersionBehind } from "@/lib/blob-version";

export const CATALOG_BLOB_PATH = "camisetas/catalog/state-v1.json";
const CATALOG_READ_RETRIES = 3;

class CatalogReadConsistencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CatalogReadConsistencyError";
  }
}

let writeQueue = Promise.resolve();

function getBlobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not configured. Set it before editing the catalog.");
  return token;
}

function parseCatalogState(value: unknown): CatalogState {
  if (!value || typeof value !== "object") throw new Error("El Blob del catálogo no contiene un JSON válido.");
  const candidate = value as Partial<CatalogState>;
  if (candidate.schemaVersion !== CATALOG_STATE_VERSION || typeof candidate.version !== "number" ||
      typeof candidate.updatedAt !== "string" || !Array.isArray(candidate.teams)) {
    throw new Error("El Blob del catálogo tiene un formato inválido o incompatible.");
  }
  return candidate as CatalogState;
}

async function readCatalogDocumentOnce(): Promise<{ state: CatalogState; etag?: string }> {
  const token = getBlobToken();

  try {
    const metadata = await head(CATALOG_BLOB_PATH, { token });
    const url = new URL(metadata.url);
    url.searchParams.set("etag", metadata.etag);
    const response = await fetch(url, { cache: "no-store" });
    if (response.status === 404) throw new CatalogReadConsistencyError("public-read-missing");
    if (response.status === 401 || response.status === 403) {
      throw new Error("No se pudo leer el Blob del catálogo por falta de permisos.");
    }
    if (!response.ok) throw new Error("public-read-failed");
    const state = parseCatalogState(await response.json());
    const responseEtag = response.headers.get("etag");
    if (responseEtag && responseEtag.replace(/^W\//, "") !== metadata.etag.replace(/^W\//, "")) {
      throw new CatalogReadConsistencyError("public-read-etag-mismatch");
    }
    let currentMetadata: Awaited<ReturnType<typeof head>>;
    try {
      currentMetadata = await head(CATALOG_BLOB_PATH, { token });
    } catch (error) {
      if (error instanceof BlobNotFoundError) throw new CatalogReadConsistencyError("head-missing-after-read");
      throw error;
    }
    if (currentMetadata.etag !== metadata.etag) throw new CatalogReadConsistencyError("head-changed-during-read");
    return { state, etag: metadata.etag };
  } catch (error) {
    if (error instanceof CatalogReadConsistencyError) throw error;
    if (error instanceof BlobNotFoundError) return { state: createCatalogState(teamsMock) };
    if (error instanceof Error && error.message === "No se pudo leer el Blob del catálogo por falta de permisos.") {
      throw error;
    }
    if (!(error instanceof BlobError)) {
      throw new Error("No se pudo leer el Blob del catálogo por un problema transitorio de red. Intentá nuevamente.", {
        cause: error,
      });
    }
    if (
      error instanceof BlobAccessError ||
      error instanceof BlobClientTokenExpiredError ||
      error instanceof BlobStoreNotFoundError ||
      error instanceof BlobStoreSuspendedError
    ) {
      throw new Error("No se pudo leer el Blob del catálogo por falta de permisos. Verificá la configuración del Blob Store.", {
        cause: error,
      });
    }
    throw new Error("No se pudo leer el Blob del catálogo por un problema transitorio de red. Intentá nuevamente.", {
      cause: error,
    });
  }
}

async function readCatalogDocument(minVersion?: number): Promise<{ state: CatalogState; etag?: string }> {
  let document: { state: CatalogState; etag?: string } | undefined;
  for (let attempt = 0; attempt < CATALOG_READ_RETRIES; attempt += 1) {
    try {
      document = await readCatalogDocumentOnce();
      if (minVersion === undefined || !isStateVersionBehind(document.state.version, minVersion)) return document;
    } catch (error) {
      if (!(error instanceof CatalogReadConsistencyError)) throw error;
    }
    if (attempt < CATALOG_READ_RETRIES - 1) await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
  }
  throw new Error("No se pudo confirmar la versión actual del catálogo. Es un problema transitorio de consistencia; intentá nuevamente.");
}

export async function readCatalogState() {
  return (await readCatalogDocument()).state;
}

export async function confirmCatalogVersion(expectedVersion: number) {
  return (await readCatalogDocument(expectedVersion)).state;
}

async function writeCatalogState(state: CatalogState, etag?: string) {
  const token = getBlobToken();
  await put(CATALOG_BLOB_PATH, JSON.stringify(state), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: Boolean(etag),
    contentType: "application/json",
    ...(etag ? { ifMatch: etag } : {}),
    token,
  });
}

export async function updateCatalogState(expectedVersion: number, update: (state: CatalogState) => CatalogState) {
  const operation = writeQueue.then(async () => {
    let preconditionError: BlobPreconditionFailedError | undefined;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const { state: current, etag } = await readCatalogDocument(expectedVersion);
      if (isStateVersionBehind(current.version, expectedVersion)) {
        throw new Error("No se pudo confirmar la versión actual del catálogo. Es un problema transitorio de consistencia; intentá nuevamente.");
      }
      if (attempt === 0 && current.version !== expectedVersion) continue;
      const next = update(current);
      const state: CatalogState = {
        ...next,
        schemaVersion: CATALOG_STATE_VERSION,
        version: current.version + 1,
        updatedAt: new Date().toISOString(),
      };
      try {
        await writeCatalogState(state, etag);
        return state;
      } catch (error) {
        if (error instanceof BlobPreconditionFailedError) {
          preconditionError = error;
          continue;
        }
        throw error;
      }
    }
    throw new Error("El catálogo cambió en otra sesión. Recargá el panel e intentá nuevamente.", { cause: preconditionError });
  });
  writeQueue = operation.then(() => undefined, () => undefined);
  return operation;
}
