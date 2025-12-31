import { useState, useEffect } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  sender_type: "admin" | "seller";
  message: string;
  created_at: string;
  is_read: boolean;
}

interface SellerChatWidgetProps {
  storeId: string;
}

const SellerChatWidget = ({ storeId }: SellerChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel("admin-chat")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_chats",
          filter: `store_id=eq.${storeId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMsg]);
          if (newMsg.sender_type === "admin" && !isOpen) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeId, isOpen]);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_chats")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: true });

    if (data) {
      const typedMessages = data.map((msg) => ({
        ...msg,
        sender_type: msg.sender_type as "admin" | "seller",
      }));
      setMessages(typedMessages);
      setUnreadCount(typedMessages.filter((m) => m.sender_type === "admin" && !m.is_read).length);
    }
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const { error } = await supabase.from("admin_chats").insert({
      store_id: storeId,
      sender_type: "seller",
      message: newMessage.trim(),
    });

    if (error) {
      toast({ title: "Error sending message", variant: "destructive" });
    } else {
      setNewMessage("");
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  return (
    <>
      {/* Chat Button */}
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
          className="h-14 w-14 rounded-full shadow-lg"
          size="icon"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <>
              <MessageCircle className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </>
          )}
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 z-50 w-80"
          >
            <Card className="flex flex-col overflow-hidden shadow-xl">
              {/* Header */}
              <div className="bg-primary p-3 text-primary-foreground">
                <h3 className="font-semibold">Support Chat</h3>
                <p className="text-xs opacity-80">Chat with the isoko.io team</p>
              </div>

              {/* Messages */}
              <div className="h-64 overflow-y-auto p-3 space-y-2">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">
                    No messages yet. Send us a message!
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-lg p-2 text-sm ${
                        msg.sender_type === "seller"
                          ? "ml-8 bg-primary text-primary-foreground"
                          : "mr-8 bg-secondary"
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p className="mt-1 text-xs opacity-70">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2 border-t p-3">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="text-sm"
                />
                <Button size="icon" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SellerChatWidget;
