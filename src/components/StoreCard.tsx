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
          {/* Cover Image */}
          <div className="relative h-40 overflow-hidden">
            <img
              src={store.coverImage}
              alt={store.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
            
            {/* Logo */}
            <div className="absolute -bottom-6 left-4">
              <div className="h-14 w-14 overflow-hidden rounded-xl border-4 border-card bg-card shadow-md">
                <img
                  src={store.logo}
                  alt={`${store.name} logo`}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Category Badge */}
            <Badge className="absolute right-3 top-3 bg-background/90 text-foreground backdrop-blur-sm">
              {category?.icon} {category?.name}
            </Badge>
          </div>

          {/* Content */}
          <div className="p-4 pt-8">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {store.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {store.description}
            </p>

            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="truncate max-w-[120px]">{store.location.address}</span>
              </div>
              <div className="flex items-center gap-1 text-primary font-medium">
                <Users className="h-4 w-4" />
                <span>{store.followers.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default StoreCard;
