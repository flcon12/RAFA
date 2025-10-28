export interface Product {
  id: number;
  name: string;
  category: 'premium' | 'volume' | 'nicho';
  volume: string;
  price: number;
  margin: string;
  image: string; // image url
  description: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Levity com Gás",
    category: "premium",
    volume: "510ml",
    price: 2.75,
    margin: "122%",
    image: "https://picsum.photos/id/1060/400/400",
    description: "Água mineral premium com gás",
  },
  {
    id: 2,
    name: "Levity sem Gás",
    category: "premium",
    volume: "510ml",
    price: 2.50,
    margin: "122%",
    image: "https://picsum.photos/id/206/400/400",
    description: "Água mineral premium sem gás",
  },
  {
    id: 3,
    name: "Água Leve com Gás",
    category: "volume",
    volume: "1,5L",
    price: 1.89,
    margin: "117%",
    image: "https://picsum.photos/id/103/400/400",
    description: "Água mineral para alto volume",
  },
  {
    id: 4,
    name: "Água Leve sem Gás",
    category: "volume",
    volume: "1,5L",
    price: 1.65,
    margin: "117%",
    image: "https://picsum.photos/id/28/400/400",
    description: "Água mineral para alto volume",
  },
  {
    id: 5,
    name: "Copos 200ml",
    category: "volume",
    volume: "200ml",
    price: 0.69,
    margin: "117%",
    image: "https://picsum.photos/id/30/400/400",
    description: "Formato econômico para eventos",
  },
  {
    id: 6,
    name: "H2O! Limão",
    category: "nicho",
    volume: "Unitário",
    price: 3.75,
    margin: "134%",
    image: "https://picsum.photos/id/1015/400/400",
    description: "Bebida funcional com sabor natural",
  },
];