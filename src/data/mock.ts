export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  sizes: string[];
  colors: string[];
  category: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  banner: string;
  products: Product[];
}

export const TEAMS: Team[] = [
  {
    id: "river",
    name: "River Plate",
    slug: "river",
    banner: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2000",
    products: [
      { id: "r1", name: "Camiseta Titular 24/25", price: 95000, image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500&q=80", sizes: ["S", "M", "L", "XL"], colors: ["Blanco/Rojo"], category: "Camisetas" },
      { id: "r2", name: "Camiseta Suplente", price: 89000, image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&q=80", sizes: ["M", "L"], colors: ["Negro"], category: "Camisetas" },
      { id: "r3", name: "Chomba Entrenamiento", price: 45000, image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&q=80", sizes: ["S", "M", "L"], colors: ["Rojo"], category: "Indumentaria" },
    ]
  },
  {
    id: "boca",
    name: "Boca Juniors",
    slug: "boca",
    banner: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&q=80&w=2000",
    products: [
      { id: "b1", name: "Camiseta Titular 24/25", price: 95000, image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500&q=80", sizes: ["S", "M", "L", "XL"], colors: ["Azul/Oro"], category: "Camisetas" },
      { id: "b2", name: "Camiseta Alternativa", price: 89000, image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&q=80", sizes: ["M", "L", "XL"], colors: ["Amarillo"], category: "Camisetas" },
    ]
  },
  {
    id: "independiente",
    name: "Independiente",
    slug: "independiente",
    banner: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=2000",
    products: [
      { id: "i1", name: "Camiseta Oficial", price: 85000, image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500&q=80", sizes: ["S", "M", "L"], colors: ["Rojo"], category: "Camisetas" },
    ]
  },
  {
    id: "racing",
    name: "Racing Club",
    slug: "racing",
    banner: "https://images.unsplash.com/photo-1431324155629-1a6eda1eedfa?auto=format&fit=crop&q=80&w=2000",
    products: [
      { id: "ra1", name: "Camiseta Oficial", price: 85000, image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500&q=80", sizes: ["S", "M", "L", "XL"], colors: ["Celeste/Blanco"], category: "Camisetas" },
    ]
  }
];
