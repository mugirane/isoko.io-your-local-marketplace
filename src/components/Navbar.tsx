import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Menu, X, Store, User, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/stores", label: "Stores" },
    { href: "/categories", label: "Categories" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <ShoppingBag className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-gradient">isoko.io</span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="hidden flex-1 max-w-xl md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              variant="search"
              placeholder="Search stores, products, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons - Desktop */}
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/create-store">
            <Button variant="outline" size="sm" className="gap-2">
              <Store className="h-4 w-4" />
              Open Store
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="sm" className="gap-2">
              <User className="h-4 w-4" />
              Sign In
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="border-t bg-background p-4 md:hidden"
        >
          {/* Mobile Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary ${
                  location.pathname === link.href ? "bg-secondary text-primary" : "text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2">
              <Link to="/create-store" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full gap-2">
                  <Store className="h-4 w-4" />
                  Open Store
                </Button>
              </Link>
              <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full gap-2">
                  <User className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            </div>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Navbar;
