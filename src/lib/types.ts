export interface Store {
  id: string;
  name: string;
  description: string;
  ownerName: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  category: string;
  coverImage: string;
  logo: string;
  followers: number;
  isFollowing?: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  images: string[];
  inStock: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count?: number;
}

export const CATEGORIES: Category[] = [
  { id: "electronics", name: "Electronics", icon: "📱" },
  { id: "fashion", name: "Fashion & Clothing", icon: "👗" },
  { id: "food", name: "Food & Groceries", icon: "🍎" },
  { id: "home", name: "Home & Living", icon: "🏠" },
  { id: "beauty", name: "Beauty & Health", icon: "💄" },
  { id: "sports", name: "Sports & Outdoors", icon: "⚽" },
  { id: "books", name: "Books & Stationery", icon: "📚" },
  { id: "automotive", name: "Automotive", icon: "🚗" },
  { id: "toys", name: "Toys & Games", icon: "🎮" },
  { id: "jewelry", name: "Jewelry & Accessories", icon: "💍" },
  { id: "art", name: "Art & Crafts", icon: "🎨" },
  { id: "services", name: "Services", icon: "🔧" },
];

// Mock data for demonstration
export const MOCK_STORES: Store[] = [
  {
    id: "1",
    name: "TechHub Rwanda",
    description: "Your one-stop shop for the latest electronics and gadgets. We offer quality phones, laptops, and accessories at competitive prices.",
    ownerName: "Jean Pierre Habimana",
    email: "techhub@email.com",
    phone: "+250788123456",
    whatsapp: "+250788123456",
    location: { address: "KN 4 Ave, Kigali", lat: -1.9403, lng: 29.8739 },
    category: "electronics",
    coverImage: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200",
    followers: 1250,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Fashion Elegance",
    description: "Premium African fashion and modern clothing for men and women. Traditional meets contemporary style.",
    ownerName: "Marie Claire Uwimana",
    email: "fashionelegance@email.com",
    phone: "+250788234567",
    whatsapp: "+250788234567",
    location: { address: "KG 11 Ave, Kigali", lat: -1.9536, lng: 30.0606 },
    category: "fashion",
    coverImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    logo: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=200",
    followers: 890,
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    name: "Fresh Market",
    description: "Fresh organic produce, local fruits, vegetables, and groceries delivered to your doorstep.",
    ownerName: "Emmanuel Niyonzima",
    email: "freshmarket@email.com",
    phone: "+250788345678",
    whatsapp: "+250788345678",
    location: { address: "KK 15 Rd, Kigali", lat: -1.9578, lng: 30.1127 },
    category: "food",
    coverImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
    logo: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=200",
    followers: 2100,
    createdAt: "2023-11-10",
  },
  {
    id: "4",
    name: "Beauty Haven",
    description: "Natural beauty products, skincare, and cosmetics. Locally sourced and organic ingredients.",
    ownerName: "Claudine Mukakarara",
    email: "beautyhaven@email.com",
    phone: "+250788456789",
    whatsapp: "+250788456789",
    location: { address: "KN 78 St, Kigali", lat: -1.9344, lng: 30.0594 },
    category: "beauty",
    coverImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800",
    logo: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200",
    followers: 560,
    createdAt: "2024-03-05",
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    storeId: "1",
    name: "iPhone 15 Pro Max",
    description: "Latest Apple flagship with titanium design and A17 Pro chip",
    price: 1199,
    currency: "USD",
    category: "electronics",
    images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400"],
    inStock: true,
    createdAt: "2024-03-01",
  },
  {
    id: "p2",
    storeId: "1",
    name: "MacBook Pro 14\"",
    description: "Powerful laptop for professionals with M3 chip",
    price: 1999,
    currency: "USD",
    category: "electronics",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400"],
    inStock: true,
    createdAt: "2024-03-02",
  },
  {
    id: "p3",
    storeId: "2",
    name: "African Print Dress",
    description: "Beautiful handmade African print maxi dress",
    price: 85,
    currency: "USD",
    category: "fashion",
    images: ["https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400"],
    inStock: true,
    createdAt: "2024-03-03",
  },
  {
    id: "p4",
    storeId: "3",
    name: "Organic Fruit Basket",
    description: "Fresh seasonal fruits from local farms",
    price: 25,
    currency: "USD",
    category: "food",
    images: ["https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400"],
    inStock: true,
    createdAt: "2024-03-04",
  },
];
