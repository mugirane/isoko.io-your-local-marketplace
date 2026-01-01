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
  is_visible: boolean;
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
  store_category_id: string | null;
  images: string[];
  in_stock: boolean;
  is_hidden: boolean;
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

// Format price with RWF currency
export const formatPrice = (price: number, currency: string = "RWF"): string => {
  return new Intl.NumberFormat('rw-RW', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' ' + currency;
};
