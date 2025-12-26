import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StoreCard from "@/components/StoreCard";
import { MOCK_STORES, CATEGORIES } from "@/lib/types";

const CategoriesPage = () => {
  const { categoryId } = useParams();

  // If category ID is provided, show stores in that category
  if (categoryId) {
    const category = CATEGORIES.find((c) => c.id === categoryId);
    const categoryStores = MOCK_STORES.filter((s) => s.category === categoryId);

    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          {/* Back Button */}
          <div className="container py-4">
            <Link to="/categories" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              All Categories
            </Link>
          </div>

          {/* Header */}
          <section className="bg-secondary/50 py-12">
            <div className="container">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <span className="text-6xl mb-4 inline-block">{category?.icon}</span>
                <h1 className="text-3xl font-bold md:text-4xl">{category?.name}</h1>
                <p className="mt-2 text-muted-foreground">
                  {categoryStores.length} store{categoryStores.length !== 1 ? "s" : ""} in this category
                </p>
              </motion.div>
            </div>
          </section>

          {/* Stores Grid */}
          <section className="py-12">
            <div className="container">
              {categoryStores.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {categoryStores.map((store, index) => (
                    <StoreCard key={store.id} store={store} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No stores in this category yet.</p>
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    );
  }

  // Show all categories
  const categoriesWithCounts = CATEGORIES.map((cat) => ({
    ...cat,
    count: MOCK_STORES.filter((s) => s.category === cat.id).length,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Header */}
        <section className="bg-secondary/50 py-12">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold md:text-4xl">Browse Categories</h1>
              <p className="mt-2 text-muted-foreground">
                Find stores by product category
              </p>
            </motion.div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-12">
          <div className="container">
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {categoriesWithCounts.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/categories/${category.id}`}>
                    <div className="group rounded-2xl border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer">
                      <span className="text-5xl mb-4 inline-block group-hover:scale-110 transition-transform duration-300">
                        {category.icon}
                      </span>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {category.count} store{category.count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CategoriesPage;
