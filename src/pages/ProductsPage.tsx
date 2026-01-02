import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, Store, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, CATEGORIES } from "@/lib/types";
import type { Product, Store as StoreType } from "@/lib/types";

interface ProductWithStore extends Product {
  store: StoreType;
}

const ProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["all-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          store:stores(*)
        `)
        .eq("in_stock", true)
        .eq("is_hidden", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProductWithStore[];
    },
  });

  const filteredProducts = products?.filter((product) => {
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategory ||
      product.category === selectedCategory ||
      product.store?.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-secondary/30 py-8">
        <div className="container">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold md:text-4xl">All Products</h1>
            <p className="mt-2 text-muted-foreground">
              Search and discover products from local stores
            </p>
          </div>

          {/* Search */}
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filters - horizontal scrollable on mobile */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="shrink-0"
            >
              All
            </Button>
            {CATEGORIES.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="shrink-0"
              >
                {category.icon} {category.name}
              </Button>
            ))}
          </div>

          {/* Products Grid - 2 columns on mobile */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-48 sm:h-72 rounded-xl" />
              ))}
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} variant="product" className="overflow-hidden">
                  <Link to={`/product/${product.id}`}>
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={product.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      {!product.in_stock && (
                        <Badge variant="destructive" className="absolute right-2 top-2">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-lg font-bold text-primary">
                        {formatPrice(product.price, product.currency)}
                      </p>
                      {product.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </Link>
                  {/* Store Info */}
                  {product.store && (
                    <Link
                      to={`/store/${product.store.id}`}
                      className="flex items-center gap-2 border-t p-3 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="h-8 w-8 overflow-hidden rounded-full bg-primary/10">
                        {product.store.logo ? (
                          <img
                            src={product.store.logo}
                            alt={product.store.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Store className="h-4 w-4 text-primary" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground truncate">
                        {product.store.name}
                      </span>
                    </Link>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 text-xl font-semibold">No products found</h3>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default ProductsPage;
