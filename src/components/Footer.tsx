import { Link } from "react-router-dom";
import { ShoppingBag, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-navy text-primary-foreground">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <ShoppingBag className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">isoko.io</span>
            </Link>
            <p className="text-sm text-primary-foreground/70">
              Discover local stores and products. Connect directly with business owners via WhatsApp.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/stores" className="text-sm text-primary-foreground/70 hover:text-primary transition-colors">
                  Browse Stores
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm text-primary-foreground/70 hover:text-primary transition-colors">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-sm text-primary-foreground/70 hover:text-primary transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/create-store" className="text-sm text-primary-foreground/70 hover:text-primary transition-colors">
                  Open Your Store
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="mb-4 font-semibold">Popular Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/categories/electronics" className="text-sm text-primary-foreground/70 hover:text-primary transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/categories/fashion" className="text-sm text-primary-foreground/70 hover:text-primary transition-colors">
                  Fashion
                </Link>
              </li>
              <li>
                <Link to="/categories/food" className="text-sm text-primary-foreground/70 hover:text-primary transition-colors">
                  Food & Groceries
                </Link>
              </li>
              <li>
                <Link to="/categories/beauty" className="text-sm text-primary-foreground/70 hover:text-primary transition-colors">
                  Beauty
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-semibold">Contact Us</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Mail className="h-4 w-4" />
                kigaliyoungcoders@gmail.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-primary-foreground/10 pt-8 text-center">
          <p className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} isoko.io. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
