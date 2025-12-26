import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
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
      <Card variant="product" className="h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <img
            src={product.images[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400"}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {!product.in_stock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>

          <div className="mt-auto pt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price, product.currency)}
              </span>
              {store && (
                <Button
                  variant="whatsapp"
                  size="sm"
                  onClick={handleWhatsAppOrder}
                  disabled={!product.in_stock}
                  className="gap-1"
                >
                  <MessageCircle className="h-4 w-4" />
                  Order
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
