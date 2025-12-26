import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Category } from "@/lib/types";

interface CategoryCardProps {
  category: Category;
  index?: number;
}

const CategoryCard = ({ category, index = 0 }: CategoryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/categories/${category.id}`}>
        <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-secondary hover:bg-primary/10 transition-all duration-300 cursor-pointer group">
          <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
            {category.icon}
          </span>
          <span className="text-sm font-medium text-center text-foreground group-hover:text-primary transition-colors">
            {category.name}
          </span>
          {category.count !== undefined && (
            <span className="text-xs text-muted-foreground">
              {category.count} stores
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
