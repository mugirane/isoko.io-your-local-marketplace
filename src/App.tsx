import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StorePage from "./pages/StorePage";
import StoresPage from "./pages/StoresPage";
import CategoriesPage from "./pages/CategoriesPage";
import CreateStorePage from "./pages/CreateStorePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductsPage from "./pages/ProductsPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import DashboardPage from "./pages/DashboardPage";
import AdminPortal from "./pages/AdminPortal";
import AffiliatePage from "./pages/AffiliatePage";
import MobileBottomNav from "./components/MobileBottomNav";

const queryClient = new QueryClient();

const App = () => {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
const parts = hostname.split(".");
let subdomain: string | null = null;

if (parts.length === 3 && parts[0] !== "www") {
  subdomain = parts[0]; // store or admin
}

  const isAdminSubdomain = subdomain === "admin";
  const isStoreSubdomain =
    subdomain && subdomain !== "admin";

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            {isAdminSubdomain ? (
              <>
                {/* admin.isoko.store */}
                <Route path="/" element={<AdminPortal />} />
                <Route path="*" element={<NotFound />} />
              </>
            ) : isStoreSubdomain ? (
              <>
                {/* store.isoko.store */}
                <Route
                  path="/"
                  element={<StorePage subdomain={subdomain} />}
                />
                <Route path="*" element={<NotFound />} />
              </>
            ) : (
              <>
                {/* isoko.store */}
                <Route path="/" element={<StoresPage />} />
                <Route path="/stores" element={<StoresPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/categories/:categoryId" element={<CategoriesPage />} />
                <Route path="/create-store" element={<CreateStorePage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/affiliate" element={<AffiliatePage />} />
                <Route path="*" element={<NotFound />} />
              </>
            )}
          </Routes>
            <MobileBottomNav />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
