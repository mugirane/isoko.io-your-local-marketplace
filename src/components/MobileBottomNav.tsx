import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Store, ShoppingBag, Grid3X3, User, LayoutDashboard, LogOut, ShoppingCart, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import CartSheet from "@/components/CartSheet";

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { getItemCount } = useCart();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsLoggedIn(!!session?.user);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
    navigate("/");
    setShowMenu(false);
  };

  const navItems = [
    { href: "/", label: "Stores", icon: Store },
    { href: "/products", label: "Products", icon: ShoppingBag },
    { href: "/categories", label: "Categories", icon: Grid3X3 },
  ];

  // Hide on admin pages
  if (location.pathname.includes("/admin")) {
    return null;
  }

  const itemCount = getItemCount();

  return (
    <>
      {/* Free Trial Banner - Only show on create-store page */}
      {!isLoggedIn && location.pathname === "/create-store" && (
        <div className="fixed bottom-16 left-0 right-0 z-40 bg-primary/90 text-primary-foreground text-center py-1.5 text-xs md:hidden">
          <span className="flex items-center justify-center gap-1">
            <Plus className="h-3 w-3" />
            <strong>3 weeks free</strong> then 8,000 RWF/month
          </span>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || 
              (item.href === "/" && location.pathname === "/stores");
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          
          {/* Cart Button */}
          <div className="flex flex-col items-center gap-1 px-3 py-1">
            <div className="relative">
              <CartSheet />
              {itemCount > 0 && (
                <Badge className="absolute -right-2 -top-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]">
                  {itemCount}
                </Badge>
              )}
            </div>
          </div>

          {/* Account/Dashboard */}
          {isLoggedIn ? (
            <Sheet open={showMenu} onOpenChange={setShowMenu}>
              <SheetTrigger asChild>
                <button className="flex flex-col items-center gap-1 px-3 py-1 transition-colors text-muted-foreground">
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="text-xs font-medium">Menu</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto">
                <SheetHeader>
                  <SheetTitle>Account</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 py-4">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary"
                    onClick={() => setShowMenu(false)}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary text-destructive"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Link
              to="/auth"
              className="flex flex-col items-center gap-1 px-3 py-1 transition-colors text-muted-foreground"
            >
              <User className="h-5 w-5" />
              <span className="text-xs font-medium">Account</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
