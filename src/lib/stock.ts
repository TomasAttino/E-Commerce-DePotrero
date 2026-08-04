import type { Product, Team } from "../../public/camisetas/mock.ts";

export const STOCK_STATE_VERSION = 1;

export type ProductStockOverride = {
  exhausted: boolean;
  unavailableSizes: string[];
};

export type StockState = {
  schemaVersion: 1;
  version: number;
  updatedAt: string;
  products: Record<string, ProductStockOverride>;
};

export type ProductWithStock = Product & {
  availableSizes: string[];
  unavailableSizes: string[];
};

export type TeamWithStock = Omit<Team, "products"> & {
  products: ProductWithStock[];
};

export function emptyStockState(): StockState {
  return {
    schemaVersion: STOCK_STATE_VERSION,
    version: 0,
    updatedAt: new Date(0).toISOString(),
    products: {},
  };
}

export function resolveUnavailableTeamsStock(teams: Team[]): TeamWithStock[] {
  return teams.map((team) => ({
    ...team,
    products: team.products.map((product) => ({
      ...product,
      inStock: false,
      availableSizes: [],
      unavailableSizes: [...product.sizes],
    })),
  }));
}

export function resolveProductStock(
  product: Product,
  state: StockState,
): ProductWithStock {
  const override = state.products[product.id];
  const unavailableSizes = override?.exhausted
    ? [...product.sizes]
    : override?.unavailableSizes.filter((size) => product.sizes.includes(size)) ??
      (product.inStock ? [] : [...product.sizes]);
  const availableSizes = product.sizes.filter((size) => !unavailableSizes.includes(size));

  return {
    ...product,
    availableSizes,
    unavailableSizes,
    inStock: availableSizes.length > 0,
  };
}

export function resolveTeamsStock(teams: Team[], state: StockState): TeamWithStock[] {
  return teams.map((team) => ({
    ...team,
    products: team.products.map((product) => resolveProductStock(product, state)),
  }));
}

export function filterStockTeams(teams: TeamWithStock[], searchTerm: string): TeamWithStock[] {
  const query = searchTerm.trim().toLowerCase();
  return teams
    .map((team) => ({
      ...team,
      products: team.products.filter((product) =>
        [team.name, product.name, product.id].some((value) => value.toLowerCase().includes(query)),
      ),
    }))
    .filter((team) => team.products.length > 0);
}

function assertSize(product: Product, size: string) {
  if (!product.sizes.includes(size)) {
    throw new Error("El talle seleccionado no pertenece al producto.");
  }
}

export function toggleProductSize(
  state: StockState,
  product: Product,
  size: string,
): StockState {
  assertSize(product, size);
  const current = resolveProductStock(product, state);
  const isAvailable = current.availableSizes.includes(size);
  const unavailableSizes = isAvailable
    ? [...new Set([...current.unavailableSizes, size])]
    : current.unavailableSizes.filter((currentSize) => currentSize !== size);

  return {
    ...state,
    products: {
      ...state.products,
      [product.id]: {
        exhausted: false,
        unavailableSizes,
      },
    },
  };
}

export function exhaustProduct(state: StockState, product: Product): StockState {
  return {
    ...state,
    products: {
      ...state.products,
      [product.id]: {
        exhausted: true,
        unavailableSizes: [],
      },
    },
  };
}
