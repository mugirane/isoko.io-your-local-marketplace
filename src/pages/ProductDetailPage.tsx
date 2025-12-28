import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MessageCircle, ChevronLeft, ChevronRight, Store as StoreIcon, Package } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct, useStore } from "@/hooks/useStores";
import { formatPrice } from "@/lib/types";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { data: product, isLoading: productLoading } = useProduct(id);
  const { data: store, isLoading: storeLoading } = useStore(product?.store_id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isLoading = productLoading || storeLoading;

  const handleWhatsAppOrder = () => {
    if (!store || !product) return;
    
    const message = encodeURIComponent(
      `Hi! I'm interested in ordering: ${product.name} (${formatPrice(product.price, product.currency)}) from isoko.io`
    );
    window.open(`https://wa.me/${store.whatsapp.replace(/\+/g, '')}?text=${message}`, '_blank');
  };

  const nextImage = () => {
    if (product?.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Product not found</h1>
            <Link to="/" className="mt-4 text-primary hover:underline inline-block">
              Go back home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ["https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800"];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Back Button */}
        <div className="container py-4">
          <Link 
            to={store ? `/store/${store.id}` : "/"} 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {store ? `Back to ${store.name}` : "Back"}
          </Link>
        </div>

        <div className="container pb-12">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={images[currentImageIndex]}
                    alt={`${product.name} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </AnimatePresence>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full opacity-80 hover:opacity-100"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full opacity-80 hover:opacity-100"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}

                {/* Out of Stock Overlay */}
                {!product.in_stock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                    <Badge variant="destructive" className="text-lg px-4 py-2">Out of Stock</Badge>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex 
                          ? "border-primary ring-2 ring-primary/20" 
                          : "border-transparent hover:border-border"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} - Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Category Badge */}
              {product.category && (
                <Badge variant="secondary" className="text-xs">
                  {product.category}
                </Badge>
              )}

              {/* Product Name */}
              <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>

              {/* Price */}
              <div className="text-3xl font-bold text-primary">
                {formatPrice(product.price, product.currency)}
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${product.in_stock ? "bg-green-500" : "bg-red-500"}`} />
                <span className={product.in_stock ? "text-green-600" : "text-red-600"}>
                  {product.in_stock ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              {/* Order Button */}
              {store && (
                <Button
                  variant="whatsapp"
                  size="lg"
                  onClick={handleWhatsAppOrder}
                  disabled={!product.in_stock}
                  className="gap-2 w-full md:w-auto"
                >
                  <MessageCircle className="h-5 w-5" />
                  Order via WhatsApp
                </Button>
              )}

              {/* Store Info */}
              {store && (
                <Link to={`/store/${store.id}`}>
                  <div className="mt-8 p-4 rounded-xl border bg-card hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-secondary">
                        {store.logo ? (
                          <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <StoreIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sold by</p>
                        <p className="font-semibold">{store.name}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
