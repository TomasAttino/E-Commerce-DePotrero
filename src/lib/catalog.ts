import type { Product, Team } from "../../public/camisetas/mock";

export const CATALOG_STATE_VERSION = 1;

export type CatalogState = {
  schemaVersion: 1;
  version: number;
  updatedAt: string;
  teams: Team[];
};

export type CatalogProductInput = Omit<Product, "hoverImage" | "inStock"> & {
  hoverImage?: string;
  inStock?: boolean;
};

export function createCatalogState(teams: Team[]): CatalogState {
  return {
    schemaVersion: CATALOG_STATE_VERSION,
    version: 0,
    updatedAt: new Date(0).toISOString(),
    teams: structuredClone(teams),
  };
}

export function flattenCatalog(state: CatalogState) {
  return state.teams.flatMap((team) => team.products.map((product) => ({ product, team })));
}

export function findCatalogProduct(state: CatalogState, productId: string) {
  return flattenCatalog(state).find(({ product }) => product.id === productId)?.product;
}

export function findCatalogTeam(state: CatalogState, teamId: string) {
  return state.teams.find((team) => team.id === teamId);
}

export function updateCatalogProduct(
  state: CatalogState,
  productId: string,
  update: Partial<Pick<Product, "name" | "price" | "category" | "image" | "hoverImage" | "sizes">> & { teamId?: string },
): CatalogState {
  const current = flattenCatalog(state).find(({ product }) => product.id === productId);
  if (!current) throw new Error("El producto no existe en el catálogo público.");
  const team = update.teamId ? findCatalogTeam(state, update.teamId) : current.team;
  if (!team) throw new Error("El equipo seleccionado no existe en el catálogo público.");

  const product = { ...current.product, ...update };
  delete (product as Partial<Product> & { teamId?: string }).teamId;
  return {
    ...state,
    teams: state.teams.map((candidate) => ({
      ...candidate,
      products: candidate.id === current.team.id
        ? candidate.products.filter((item) => item.id !== productId)
        : candidate.products,
    })).map((candidate) => candidate.id === team.id
      ? { ...candidate, products: [...candidate.products, product] }
      : candidate),
  };
}

export function addCatalogTeam(state: CatalogState, team: Team): CatalogState {
  if (state.teams.some((item) => item.id === team.id || item.slug === team.slug)) {
    throw new Error("Ya existe un equipo con ese ID o slug.");
  }
  return { ...state, teams: [...state.teams, { ...team, products: [] }] };
}

export function addCatalogProduct(state: CatalogState, teamId: string, product: Product): CatalogState {
  const team = findCatalogTeam(state, teamId);
  if (!team) throw new Error("El equipo seleccionado no existe en el catálogo público.");
  if (findCatalogProduct(state, product.id)) throw new Error("Ya existe un producto con ese ID.");
  return {
    ...state,
    teams: state.teams.map((item) => item.id === teamId
      ? { ...item, products: [...item.products, product] }
      : item),
  };
}

export function filterCatalogProducts(state: CatalogState, query: string, teamId = "all") {
  const normalized = query.trim().toLowerCase();
  return flattenCatalog(state).filter(({ product, team }) =>
    (teamId === "all" || team.id === teamId) &&
    (!normalized || [team.name, product.name, product.id].some((value) => value.toLowerCase().includes(normalized))),
  );
}

export function paginate<T>(items: T[], page: number, pageSize = 24) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  return { items: items.slice((currentPage - 1) * pageSize, currentPage * pageSize), currentPage, totalPages };
}
