import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Users, MessageCircle, Heart, Share2, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORIES } from "@/lib/types";
import { useStore, useStoreProducts } from "@/hooks/useStores";
import { toast } from "@/hooks/use-toast";

const StorePage = () => {
  const { id } = useParams();
  const { data: store, isLoading: storeLoading } = useStore(id);
  const { data: storeProducts = [], isLoading: productsLoading } = useStoreProducts(id);
  const category = CATEGORIES.find((c) => c.id === store?.category);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  // Update follower count when store data loads
  if (store && followerCount === 0 && store.followers_count) {
    setFollowerCount(store.followers_count);
  }

  if (storeLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <div className="container py-4">
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-48 md:h-64 w-full" />
          <div className="container py-8 space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-96" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Store not found</h1>
            <Link to="/" className="mt-4 text-primary hover:underline">
              Go back home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));
    toast({
      title: isFollowing ? "Unfollowed" : "Following!",
      description: isFollowing 
        ? `You unfollowed ${store.name}` 
        : `You are now following ${store.name}`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: store.name,
        text: store.description || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Store link copied to clipboard",
      });
    }
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      `Hi! I found your store "${store.name}" on isoko.io and I'm interested in your products.`
    );
    window.open(`https://wa.me/${store.whatsapp.replace(/\+/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Back Button */}
        <div className="container py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to stores
          </Link>
        </div>

        {/* Store Header */}
        <section className="relative">
          {/* Cover Image */}
          <div className="h-48 md:h-64 overflow-hidden">
            <img
              src={store.cover_image || "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800"}
              alt={store.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>

          {/* Store Info */}
          <div className="container relative">
            <div className="flex flex-col md:flex-row gap-6 -mt-16 md:-mt-12">
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="h-24 w-24 md:h-32 md:w-32 rounded-2xl border-4 border-background bg-card shadow-lg overflow-hidden"
              >
                <img
                  src={store.logo || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200"}
                  alt={`${store.name} logo`}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Details */}
              <div className="flex-1 pb-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl md:text-3xl font-bold">{store.name}</h1>
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                        {category?.icon} {category?.name}
                      </Badge>
                    </div>
                    <p className="mt-2 text-muted-foreground max-w-xl">
                      {store.description}
                    </p>
                    
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {store.address}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {store.phone}
                      </div>
                      <div className="flex items-center gap-1 font-medium text-primary">
                        <Users className="h-4 w-4" />
                        {followerCount.toLocaleString()} followers
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant={isFollowing ? "secondary" : "default"}
                      onClick={handleFollow}
                      className="gap-2"
                    >
                      <Heart className={`h-4 w-4 ${isFollowing ? "fill-current" : ""}`} />
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                    <Button variant="whatsapp" onClick={handleWhatsAppContact} className="gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Contact
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="container py-8">
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="products">Products ({storeProducts.length})</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              {productsLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-2xl" />
                  ))}
                </div>
              ) : storeProducts.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {storeProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} store={store} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No products available yet.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="about">
              <div className="max-w-2xl space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">About {store.name}</h3>
                  <p className="text-muted-foreground">{store.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" /> {store.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> {store.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> {store.address}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Owner</h3>
                  <p className="text-muted-foreground">{store.owner_name}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="location">
              <div className="rounded-2xl overflow-hidden border bg-secondary h-80 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{store.address}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Map integration coming soon
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default StorePage;
