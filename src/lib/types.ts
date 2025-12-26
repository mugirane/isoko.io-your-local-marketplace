export interface Store {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  owner_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  category: string;
  cover_image: string | null;
  logo: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  followers_count?: number;
  is_following?: boolean;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  category: string | null;
  images: string[];
  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count?: number;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
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

// Mock data for demonstration (will be replaced by real data)
export const MOCK_STORES: Store[] = [
  {
    id: "1",
    owner_id: "mock-user-1",
    name: "TechHub Rwanda",
    description: "Your one-stop shop for the latest electronics and gadgets. We offer quality phones, laptops, and accessories at competitive prices.",
    owner_name: "Jean Pierre Habimana",
    email: "techhub@email.com",
    phone: "+250788123456",
    whatsapp: "+250788123456",
    address: "KN 4 Ave, Kigali",
    latitude: -1.9403,
    longitude: 29.8739,
    category: "electronics",
    cover_image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200",
    is_active: true,
    created_at: "2024-01-15",
    updated_at: "2024-01-15",
    followers_count: 1250,
  },
  {
    id: "2",
    owner_id: "mock-user-2",
    name: "Fashion Elegance",
    description: "Premium African fashion and modern clothing for men and women. Traditional meets contemporary style.",
    owner_name: "Marie Claire Uwimana",
    email: "fashionelegance@email.com",
    phone: "+250788234567",
    whatsapp: "+250788234567",
    address: "KG 11 Ave, Kigali",
    latitude: -1.9536,
    longitude: 30.0606,
    category: "fashion",
    cover_image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    logo: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=200",
    is_active: true,
    created_at: "2024-02-20",
    updated_at: "2024-02-20",
    followers_count: 890,
  },
  {
    id: "3",
    owner_id: "mock-user-3",
    name: "Fresh Market",
    description: "Fresh organic produce, local fruits, vegetables, and groceries delivered to your doorstep.",
    owner_name: "Emmanuel Niyonzima",
    email: "freshmarket@email.com",
    phone: "+250788345678",
    whatsapp: "+250788345678",
    address: "KK 15 Rd, Kigali",
    latitude: -1.9578,
    longitude: 30.1127,
    category: "food",
    cover_image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
    logo: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=200",
    is_active: true,
    created_at: "2023-11-10",
    updated_at: "2023-11-10",
    followers_count: 2100,
  },
  {
    id: "4",
    owner_id: "mock-user-4",
    name: "Beauty Haven",
    description: "Natural beauty products, skincare, and cosmetics. Locally sourced and organic ingredients.",
    owner_name: "Claudine Mukakarara",
    email: "beautyhaven@email.com",
    phone: "+250788456789",
    whatsapp: "+250788456789",
    address: "KN 78 St, Kigali",
    latitude: -1.9344,
    longitude: 30.0594,
    category: "beauty",
    cover_image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800",
    logo: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200",
    is_active: true,
    created_at: "2024-03-05",
    updated_at: "2024-03-05",
    followers_count: 560,
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    store_id: "1",
    name: "iPhone 15 Pro Max",
    description: "Latest Apple flagship with titanium design and A17 Pro chip",
    price: 1500000,
    currency: "RWF",
    category: "electronics",
    images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400"],
    in_stock: true,
    created_at: "2024-03-01",
    updated_at: "2024-03-01",
  },
  {
    id: "p2",
    store_id: "1",
    name: "MacBook Pro 14\"",
    description: "Powerful laptop for professionals with M3 chip",
    price: 2500000,
    currency: "RWF",
    category: "electronics",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400"],
    in_stock: true,
    created_at: "2024-03-02",
    updated_at: "2024-03-02",
  },
  {
    id: "p3",
    store_id: "2",
    name: "African Print Dress",
    description: "Beautiful handmade African print maxi dress",
    price: 85000,
    currency: "RWF",
    category: "fashion",
    images: ["https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=400"],
    in_stock: true,
    created_at: "2024-03-03",
    updated_at: "2024-03-03",
  },
  {
    id: "p4",
    store_id: "3",
    name: "Organic Fruit Basket",
    description: "Fresh seasonal fruits from local farms",
    price: 25000,
    currency: "RWF",
    category: "food",
    images: ["https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400"],
    in_stock: true,
    created_at: "2024-03-04",
    updated_at: "2024-03-04",
  },
];

// Format price with RWF currency
export const formatPrice = (price: number, currency: string = "RWF"): string => {
  return new Intl.NumberFormat('rw-RW', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' ' + currency;
};
