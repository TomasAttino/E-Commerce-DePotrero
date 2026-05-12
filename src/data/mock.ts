export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  hoverImage?: string | null;
  sizes: string[];
  colors: string[];
  category: string;
  inStock?: boolean;
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
    id: "argentina",
    name: "Argentina",
    slug: "argentina",
    banner: "https://i.pinimg.com/1200x/4d/b5/dd/4db5dd515e48f1cc90b53efbddd590b7.jpg",
    products: [
      { id: "b1", name: "Camiseta Titular 24/25", price: 95000, image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500&q=80", sizes: ["S", "M", "L", "XL"], colors: ["Azul/Oro"], category: "Camisetas" },
      { id: "b2", name: "Camiseta Alternativa", price: 89000, image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&q=80", sizes: ["M", "L", "XL"], colors: ["Amarillo"], category: "Camisetas" },
    ]
  },
  {
    id: "boca",
    name: "Boca Juniors",
    slug: "boca",
    banner: "https://i.pinimg.com/1200x/6e/53/f1/6e53f1ed86926ba6b160207344b92e53.jpg",
    products: [
      { id: "b1", name: "Camiseta Titular 24/25", price: 95000, image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500&q=80", sizes: ["S", "M", "L", "XL"], colors: ["Azul/Oro"], category: "Camisetas" },
      { id: "b2", name: "Camiseta Alternativa", price: 89000, image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&q=80", sizes: ["M", "L", "XL"], colors: ["Amarillo"], category: "Camisetas" },
    ]
  },
  {
    id: "river",
    name: "River Plate",
    slug: "river",
    banner: "https://i.pinimg.com/1200x/3e/88/11/3e88119ee4e48d6a5815b137e01977b0.jpg",
    products: [
      { id: "r1", name: "Camiseta Titular 24/25", price: 95000, image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500&q=80", sizes: ["S", "M", "L", "XL"], colors: ["Blanco/Rojo"], category: "Camisetas" },
      { id: "r2", name: "Camiseta Suplente", price: 89000, image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&q=80", sizes: ["M", "L"], colors: ["Negro"], category: "Camisetas" },
      { id: "r3", name: "Chomba Entrenamiento", price: 45000, image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&q=80", sizes: ["S", "M", "L"], colors: ["Rojo"], category: "Indumentaria" },
    ]
  },
  {
    id: "independiente",
    name: "Independiente",
    slug: "independiente",
    banner: "https://i.pinimg.com/1200x/17/7c/04/177c04b504cdc87fa106dfbc273ff434.jpg",
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
