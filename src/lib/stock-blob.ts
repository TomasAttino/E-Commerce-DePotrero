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
import { emptyStockState, STOCK_STATE_VERSION, type StockState } from "@/lib/stock";

export const STOCK_BLOB_PATH = "camisetas/stock/state-v1.json";

let writeQueue = Promise.resolve();

function getBlobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not configured. Set it before using persistent stock management.",
    );
  }
  return token;
}

function parseStockState(value: unknown): StockState {
  if (!value || typeof value !== "object") {
    throw new Error("The stock Blob does not contain a valid JSON document.");
  }

  const candidate = value as Partial<StockState>;
  if (
    candidate.schemaVersion !== STOCK_STATE_VERSION ||
    typeof candidate.version !== "number" ||
    typeof candidate.updatedAt !== "string" ||
    !candidate.products ||
    typeof candidate.products !== "object"
  ) {
    throw new Error("The stock Blob has an unsupported or invalid format.");
  }

  return candidate as StockState;
}

export async function readStockState(): Promise<StockState> {
  const { state } = await readStockDocument();
  return state;
}

async function readStockDocument(): Promise<{ state: StockState; etag?: string }> {
  const token = getBlobToken();

  try {
    const result = await get(STOCK_BLOB_PATH, { access: "private", useCache: false, token });
    if (!result) return { state: emptyStockState() };
    const metadata = await head(STOCK_BLOB_PATH, { token });
    return { state: parseStockState(await new Response(result.stream).json()), etag: metadata.etag };
  } catch (error) {
    if (error instanceof BlobNotFoundError) return { state: emptyStockState() };
    if (!(error instanceof BlobError)) {
      throw new Error("Could not read the stock Blob because of a temporary network problem. Try again.", {
        cause: error,
      });
    }
    if (
      error instanceof BlobAccessError ||
      error instanceof BlobClientTokenExpiredError ||
      error instanceof BlobStoreNotFoundError ||
      error instanceof BlobStoreSuspendedError
    ) {
      throw new Error("Could not read the stock Blob because of a permission or Blob Store configuration problem.", {
        cause: error,
      });
    }
  }

  try {
    const metadata = await head(STOCK_BLOB_PATH, { token });
    const response = await fetch(metadata.url, { cache: "no-store" });
    if (response.status === 404) return { state: emptyStockState() };
    if (response.status === 401 || response.status === 403) {
      throw new Error("Could not read the stock Blob because of a permission or Blob Store configuration problem.");
    }
    if (!response.ok) throw new Error("public-read-failed");
    return { state: parseStockState(await response.json()), etag: metadata.etag };
  } catch (error) {
    if (error instanceof BlobNotFoundError) return { state: emptyStockState() };
    if (
      error instanceof Error &&
      error.message === "Could not read the stock Blob because of a permission or Blob Store configuration problem."
    ) {
      throw error;
    }
    throw new Error("Could not read the stock Blob because of a temporary network problem. Try again.", {
      cause: error,
    });
  }
}

async function writeStockState(state: StockState, etag?: string) {
  const token = getBlobToken();
  await put(STOCK_BLOB_PATH, JSON.stringify(state), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: Boolean(etag),
    contentType: "application/json",
    ...(etag ? { ifMatch: etag } : {}),
    token,
  });
}

export async function updateStockState(
  expectedVersion: number,
  update: (state: StockState) => StockState,
): Promise<StockState> {
  const operation = writeQueue.then(async () => {
    const { state: current, etag } = await readStockDocument();
    if (current.version !== expectedVersion) {
      throw new Error("El stock cambió en otra sesión. Recargá el panel e intentá nuevamente.");
    }

    const next = update(current);
    const state = {
      ...next,
      schemaVersion: STOCK_STATE_VERSION as 1,
      version: current.version + 1,
      updatedAt: new Date().toISOString(),
    };
    // Existing documents use ETag preconditions. Creation has no ETag to compare,
    // so the first concurrent creation remains protected only by the logical version.
    try {
      await writeStockState(state, etag);
    } catch (error) {
      if (error instanceof BlobPreconditionFailedError) {
        throw new Error("El stock cambió en otra sesión. Recargá el panel e intentá nuevamente.", { cause: error });
      }
      throw error;
    }
    return state;
  });

  writeQueue = operation.then(() => undefined, () => undefined);
  return operation;
}
