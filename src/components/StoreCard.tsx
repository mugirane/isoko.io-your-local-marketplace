import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, CATEGORIES } from "@/lib/types";

interface StoreCardProps {
  store: Store;
  index?: number;
}

const StoreCard = ({ store, index = 0 }: StoreCardProps) => {
  const category = CATEGORIES.find((c) => c.id === store.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={`/store/${store.id}`}>
        <Card variant="store" className="h-full">
          {/* Cover Image - smaller on mobile */}
          <div className="relative h-24 sm:h-40 overflow-hidden">
            <img
              src={store.cover_image || "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800"}
              alt={store.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
            
            {/* Logo - smaller on mobile */}
            <div className="absolute -bottom-4 sm:-bottom-6 left-2 sm:left-4">
              <div className="h-10 w-10 sm:h-14 sm:w-14 overflow-hidden rounded-lg sm:rounded-xl border-2 sm:border-4 border-card bg-card shadow-md">
                <img
                  src={store.logo || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200"}
                  alt={`${store.name} logo`}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Category Badge - smaller on mobile */}
            <Badge className="absolute right-2 sm:right-3 top-2 sm:top-3 bg-background/90 text-foreground backdrop-blur-sm text-[10px] sm:text-xs px-1.5 sm:px-2">
              <span className="hidden sm:inline">{category?.icon} </span>{category?.name}
            </Badge>
          </div>

          {/* Content - compact on mobile */}
          <div className="p-2 sm:p-4 pt-6 sm:pt-8">
            <h3 className="font-semibold text-sm sm:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {store.name}
            </h3>
            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2">
              {store.description}
            </p>

            <div className="mt-2 sm:mt-4 flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="truncate max-w-[60px] sm:max-w-[120px]">{store.address}</span>
              </div>
              <div className="flex items-center gap-1 text-primary font-medium">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{(store.followers_count || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default StoreCard;
