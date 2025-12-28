import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import StoreCard from "@/components/StoreCard";
import CategoryCard from "@/components/CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES } from "@/lib/types";
import { useStores } from "@/hooks/useStores";

const Index = () => {
  const { data: stores = [], isLoading } = useStores();

  // Add counts to categories based on real data
  const categoriesWithCounts = CATEGORIES.map((cat) => ({
    ...cat,
    count: stores.filter((s) => s.category === cat.id).length,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Categories Section */}
        <section className="py-12 md:py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8 text-center"
            >
              <h2 className="text-2xl font-bold md:text-3xl">Browse by Category</h2>
              <p className="mt-2 text-muted-foreground">
                Find exactly what you're looking for
              </p>
            </motion.div>

            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6">
              {categoriesWithCounts.slice(0, 12).map((category, index) => (
                <CategoryCard key={category.id} category={category} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Stores Section */}
        <section className="bg-secondary/50 py-12 md:py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8 flex items-center justify-between"
            >
              <div>
                <h2 className="text-2xl font-bold md:text-3xl">Featured Stores</h2>
                <p className="mt-2 text-muted-foreground">
                  Discover popular stores near you
                </p>
              </div>
            </motion.div>

            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-2xl" />
                ))}
              </div>
            ) : stores.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stores.slice(0, 8).map((store, index) => (
                  <StoreCard key={store.id} store={store} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No stores yet. Be the first to create one!</p>
              </div>
            )}
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-12 md:py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <h2 className="text-2xl font-bold md:text-3xl">How It Works</h2>
              <p className="mt-2 text-muted-foreground">
                Simple steps to start shopping
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Browse Stores",
                  description: "Explore local stores and discover amazing products from businesses in your area.",
                  icon: "🏪",
                },
                {
                  step: "02",
                  title: "Find Products",
                  description: "Search by category or store. Follow your favorites to stay updated.",
                  icon: "🔍",
                },
                {
                  step: "03",
                  title: "Order via WhatsApp",
                  description: "Connect directly with store owners and complete your order through WhatsApp.",
                  icon: "💬",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative rounded-2xl bg-card p-6 text-center shadow-sm"
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <span className="mb-4 inline-block text-5xl">{item.icon}</span>
                  <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="gradient-hero py-16 md:py-20">
          <div className="container text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto max-w-2xl"
            >
              <h2 className="text-2xl font-bold text-primary-foreground md:text-4xl">
                Ready to Open Your Store?
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Join hundreds of local businesses already selling on isoko.io. 
                It's free to get started!
              </p>
              <a href="/create-store">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-8 rounded-xl bg-card px-8 py-4 font-semibold text-foreground shadow-lg transition-all hover:shadow-xl"
                >
                  Create Your Store Now
                </motion.button>
              </a>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
