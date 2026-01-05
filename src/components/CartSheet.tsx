import { useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart, CartItem } from "@/hooks/useCart";
import { formatPrice } from "@/lib/types";

const CartSheet = () => {
  const { items, removeItem, updateQuantity, clearCart, getItemCount, getTotal } = useCart();
  const [open, setOpen] = useState(false);

  // Group items by store
  const itemsByStore = items.reduce((acc, item) => {
    if (!acc[item.storeId]) {
      acc[item.storeId] = {
        storeName: item.storeName,
        storeWhatsapp: item.storeWhatsapp,
        items: [],
      };
    }
    acc[item.storeId].items.push(item);
    return acc;
  }, {} as Record<string, { storeName: string; storeWhatsapp: string; items: CartItem[] }>);

  const handleOrderViaWhatsApp = (storeId: string) => {
    const storeData = itemsByStore[storeId];
    if (!storeData) return;

    const orderItems = storeData.items
      .map((item) => `• ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity, item.currency)}`)
      .join("\n");

    const total = storeData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const currency = storeData.items[0]?.currency || "RWF";

    const message = encodeURIComponent(
      `Hi! I'd like to order from isoko.io:\n\n${orderItems}\n\nTotal: ${formatPrice(total, currency)}`
    );

    window.open(`https://wa.me/${storeData.storeWhatsapp.replace(/\+/g, "")}?text=${message}`, "_blank");
    
    // Remove ordered items from cart
    storeData.items.forEach((item) => removeItem(item.id));
    
    if (items.length === storeData.items.length) {
      setOpen(false);
    }
  };

  const itemCount = getItemCount();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Your cart is empty</p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-6">
                {Object.entries(itemsByStore).map(([storeId, storeData]) => (
                  <div key={storeId} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{storeData.storeName}</h4>
                      <Button
                        size="sm"
                        variant="whatsapp"
                        className="gap-1 h-7 text-xs"
                        onClick={() => handleOrderViaWhatsApp(storeId)}
                      >
                        <MessageCircle className="h-3 w-3" />
                        Order
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {storeData.items.map((item) => (
                        <div key={item.id} className="flex gap-3 p-2 rounded-lg bg-secondary/50">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-16 w-16 rounded-md object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <p className="text-sm text-primary font-semibold">
                              {formatPrice(item.price, item.currency)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-auto text-destructive"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <SheetFooter className="mt-4 flex-col gap-2">
              <div className="flex items-center justify-between w-full text-sm">
                <span className="text-muted-foreground">Total items:</span>
                <span className="font-semibold">{itemCount}</span>
              </div>
              <Button variant="outline" className="w-full" onClick={clearCart}>
                Clear Cart
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
