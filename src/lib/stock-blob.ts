import { BlobAccessError, get, put } from "@vercel/blob";
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
  let result;

  try {
    result = await get(STOCK_BLOB_PATH, { access: "private", useCache: false, token });
  } catch (error) {
    if (!(error instanceof BlobAccessError)) {
      throw new Error(
        "Could not read the stock Blob. Verify that BLOB_READ_WRITE_TOKEN belongs to this project's Blob Store and has read permission.",
        { cause: error },
      );
    }

    try {
      // Existing stock documents were public. Keep them readable while the next write migrates them.
      result = await get(STOCK_BLOB_PATH, { access: "public", useCache: false, token });
    } catch (fallbackError) {
      throw new Error(
        "Could not read the stock Blob because the token lacks permission. Verify that BLOB_READ_WRITE_TOKEN belongs to this project's Blob Store and has read permission.",
        { cause: fallbackError },
      );
    }
  }

  if (!result) return { state: emptyStockState() };
  return {
    state: parseStockState(await new Response(result.stream).json()),
    etag: result.blob.etag,
  };
}

async function writeStockState(state: StockState, etag?: string) {
  const token = getBlobToken();
  await put(STOCK_BLOB_PATH, JSON.stringify(state), {
    access: "private",
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
    await writeStockState(state, etag);
    return state;
  });

  writeQueue = operation.then(() => undefined, () => undefined);
  return operation;
}
