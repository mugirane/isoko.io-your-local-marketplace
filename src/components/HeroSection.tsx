import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Store, ShoppingBag, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleSecretDot = () => {
    navigate("/admin-portal");
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary py-16 md:py-24">
      {/* Background decoration */}
      <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      
      <div className="container relative">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <ShoppingBag className="h-4 w-4" />
              Discover Local Businesses
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
              Shop Local,{" "}
              <span className="text-gradient">Connect Direct</span>
            </h1>
            
            <p className="max-w-lg text-lg text-muted-foreground">
              Discover amazing stores in your area. Browse products, follow your favorite shops, 
              and order directly via WhatsApp. Supporting local businesses has never been easier
              <button
                onClick={handleSecretDot}
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer ml-0.5"
                aria-label="Admin access"
              >
                .
              </button>
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to="/stores">
                <Button variant="hero" size="xl" className="gap-2">
                  Explore Stores
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/create-store">
                <Button variant="dark" size="xl" className="gap-2">
                  <Store className="h-5 w-5" />
                  Open Your Store
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div>
                <p className="text-3xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">Active Stores</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">10K+</p>
                <p className="text-sm text-muted-foreground">Products</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">50K+</p>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </div>
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-md">
              {/* Main card */}
              <div className="rounded-3xl bg-card p-6 shadow-lg">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">TechHub Rwanda</h3>
                    <p className="text-sm text-muted-foreground">Electronics Store</p>
                  </div>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600"
                  alt="Store preview"
                  className="rounded-2xl object-cover aspect-video"
                />
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">1,250 followers</span>
                  <Button variant="whatsapp" size="sm" className="gap-1">
                    <MessageCircle className="h-4 w-4" />
                    Order Now
                  </Button>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -left-8 top-1/4 rounded-2xl bg-card p-4 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👗</span>
                  <span className="text-sm font-medium">Fashion</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -right-4 bottom-1/4 rounded-2xl bg-card p-4 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🍎</span>
                  <span className="text-sm font-medium">Fresh Food</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
