import {
  BlobAccessError,
  BlobClientTokenExpiredError,
  BlobError,
  BlobNotFoundError,
  BlobPreconditionFailedError,
  BlobStoreNotFoundError,
  BlobStoreSuspendedError,
  get,
  head,
  put,
} from "@vercel/blob";
import { teamsMock } from "../../public/camisetas/mock";
import { CATALOG_STATE_VERSION, createCatalogState, type CatalogState } from "@/lib/catalog";

export const CATALOG_BLOB_PATH = "camisetas/catalog/state-v1.json";

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

async function readCatalogDocument(): Promise<{ state: CatalogState; etag?: string }> {
  const token = getBlobToken();

  try {
    const result = await get(CATALOG_BLOB_PATH, { access: "private", useCache: false, token });
    if (!result) return { state: createCatalogState(teamsMock) };
    const metadata = await head(CATALOG_BLOB_PATH, { token });
    return { state: parseCatalogState(await new Response(result.stream).json()), etag: metadata.etag };
  } catch (error) {
    if (error instanceof BlobNotFoundError) return { state: createCatalogState(teamsMock) };
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
  }

  try {
    const metadata = await head(CATALOG_BLOB_PATH, { token });
    const response = await fetch(metadata.url, { cache: "no-store" });
    if (response.status === 404) return { state: createCatalogState(teamsMock) };
    if (response.status === 401 || response.status === 403) {
      throw new Error("No se pudo leer el Blob del catálogo por falta de permisos.");
    }
    if (!response.ok) throw new Error("public-read-failed");
    return { state: parseCatalogState(await response.json()), etag: metadata.etag };
  } catch (error) {
    if (error instanceof BlobNotFoundError) return { state: createCatalogState(teamsMock) };
    if (error instanceof Error && error.message === "No se pudo leer el Blob del catálogo por falta de permisos.") {
      throw error;
    }
    throw new Error("No se pudo leer el Blob del catálogo por un problema transitorio de red. Intentá nuevamente.", {
      cause: error,
    });
  }
}

export async function readCatalogState() {
  return (await readCatalogDocument()).state;
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
      const { state: current, etag } = await readCatalogDocument();
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
