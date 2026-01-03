import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Store, ShoppingBag, Grid3X3, User, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const MobileBottomNav = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  const navItems = [
    { href: "/", label: "Stores", icon: Store },
    { href: "/products", label: "Products", icon: ShoppingBag },
    { href: "/categories", label: "Categories", icon: Grid3X3 },
    { 
      href: isLoggedIn ? "/dashboard" : "/auth", 
      label: isLoggedIn ? "Dashboard" : "Account", 
      icon: isLoggedIn ? LayoutDashboard : User 
    },
  ];

  // Hide on admin pages
  if (location.pathname.includes("/admin")) {
    return null;
  }

  return (
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
      </div>
    </nav>
  );
};

export default MobileBottomNav;
