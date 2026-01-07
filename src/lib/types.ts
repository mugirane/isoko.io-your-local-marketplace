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
  currency: string;
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
  { id: "general", name: "General Shop", icon: "🛒" },
  { id: "pharmacy", name: "Pharmacy", icon: "💊" },
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

export const CURRENCIES = [
  { code: "RWF", name: "Rwandan Franc", symbol: "RWF" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KES" },
  { code: "UGX", name: "Ugandan Shilling", symbol: "UGX" },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TZS" },
  { code: "BIF", name: "Burundian Franc", symbol: "BIF" },
  { code: "CDF", name: "Congolese Franc", symbol: "CDF" },
];

// Format price with currency
export const formatPrice = (price: number, currency: string = "RWF"): string => {
  const currencyInfo = CURRENCIES.find(c => c.code === currency);
  const symbol = currencyInfo?.symbol || currency;
  
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' ' + symbol;
};
