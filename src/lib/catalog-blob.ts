import { BlobError, get, put } from "@vercel/blob";
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
  let result;

  try {
    result = await get(CATALOG_BLOB_PATH, { access: "private", useCache: false, token });
  } catch (error) {
    if (!(error instanceof BlobError)) {
      throw new Error(
        "No se pudo leer el Blob del catálogo. Verificá que BLOB_READ_WRITE_TOKEN pertenezca al Blob Store de este proyecto y tenga permisos de lectura.",
        { cause: error },
      );
    }

    try {
      // Existing catalog documents were public. Keep them readable while the next write migrates them.
      result = await get(CATALOG_BLOB_PATH, { access: "public", useCache: false, token });
    } catch (fallbackError) {
      throw new Error(
        "No se pudo leer el Blob del catálogo por falta de permisos. Verificá que BLOB_READ_WRITE_TOKEN pertenezca al Blob Store de este proyecto y tenga permisos de lectura.",
        { cause: fallbackError },
      );
    }
  }

  if (!result) return { state: createCatalogState(teamsMock) };
  return {
    state: parseCatalogState(await new Response(result.stream).json()),
    etag: result.blob.etag,
  };
}

export async function readCatalogState() {
  return (await readCatalogDocument()).state;
}

async function writeCatalogState(state: CatalogState, etag?: string) {
  const token = getBlobToken();
  await put(CATALOG_BLOB_PATH, JSON.stringify(state), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: Boolean(etag),
    contentType: "application/json",
    ...(etag ? { ifMatch: etag } : {}),
    token,
  });
}

export async function updateCatalogState(expectedVersion: number, update: (state: CatalogState) => CatalogState) {
  const operation = writeQueue.then(async () => {
    const { state: current, etag } = await readCatalogDocument();
    if (current.version !== expectedVersion) throw new Error("El catálogo cambió en otra sesión. Recargá el panel e intentá nuevamente.");
    const next = update(current);
    const state: CatalogState = {
      ...next,
      schemaVersion: CATALOG_STATE_VERSION,
      version: current.version + 1,
      updatedAt: new Date().toISOString(),
    };
    await writeCatalogState(state, etag);
    return state;
  });
  writeQueue = operation.then(() => undefined, () => undefined);
  return operation;
}
