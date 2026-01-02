import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product, Store, formatPrice } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  store?: Store;
  index?: number;
}

const ProductCard = ({ product, store, index = 0 }: ProductCardProps) => {
  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!store) return;
    
    const message = encodeURIComponent(
      `Hi! I'm interested in ordering: ${product.name} (${formatPrice(product.price, product.currency)}) from isoko.io`
    );
    window.open(`https://wa.me/${store.whatsapp.replace(/\+/g, '')}?text=${message}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/product/${product.id}`}>
        <Card variant="product" className="h-full flex flex-col">
          {/* Image - compact on mobile */}
          <div className="relative aspect-square overflow-hidden bg-secondary">
            <img
              src={product.images[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400"}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {!product.in_stock && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <Badge variant="destructive" className="text-[10px] sm:text-xs">Out of Stock</Badge>
              </div>
            )}
            {product.images.length > 1 && (
              <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-background/80 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium">
                +{product.images.length - 1}
              </div>
            )}
          </div>

          {/* Content - compact on mobile */}
          <div className="flex flex-1 flex-col p-2 sm:p-4">
            <h3 className="font-medium text-xs sm:text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2 hidden sm:block">
              {product.description}
            </p>

            <div className="mt-auto pt-2 sm:pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="text-sm sm:text-lg font-bold text-primary">
                  {formatPrice(product.price, product.currency)}
                </span>
                {store && (
                  <Button
                    variant="whatsapp"
                    size="sm"
                    onClick={handleWhatsAppOrder}
                    disabled={!product.in_stock}
                    className="gap-1 text-[10px] sm:text-sm h-7 sm:h-9 px-2 sm:px-3"
                  >
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Order</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
