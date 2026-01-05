import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Bell, Store, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  sender_type: "admin" | "seller";
  message: string;
  created_at: string;
  is_read: boolean;
  store_id: string;
}

interface StoreChat {
  store_id: string;
  store_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface AdminChatPanelProps {
  adminPassword: string;
}

const AdminChatPanel = ({ adminPassword }: AdminChatPanelProps) => {
  const [storeChats, setStoreChats] = useState<StoreChat[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [selectedStoreName, setSelectedStoreName] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Show notification on initial load if there are unread messages
  useEffect(() => {
    const checkUnreadOnLoad = async () => {
      await fetchStoreChats();
    };
    checkUnreadOnLoad();
  }, []);

  // Show toast when unread count changes
  useEffect(() => {
    const totalUnreadCount = storeChats.reduce((sum, chat) => sum + chat.unread_count, 0);
    if (totalUnreadCount > 0 && !selectedStoreId) {
      toast({
        title: `${totalUnreadCount} unread message${totalUnreadCount > 1 ? 's' : ''}`,
        description: "You have new messages from sellers",
      });
    }
  }, [storeChats.length]); // Only trigger when chats list changes

  useEffect(() => {
    // Subscribe to new messages
    const channel = supabase
      .channel("admin-all-chats")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_chats",
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          
          // If viewing this store, add message
          if (newMsg.store_id === selectedStoreId) {
            setMessages((prev) => [...prev, newMsg]);
          }
          
          // Show notification if from seller and not viewing that store
          if (newMsg.sender_type === "seller" && newMsg.store_id !== selectedStoreId) {
            toast({
              title: "New message",
              description: "You have a new message from a seller",
            });
          }
          
          // Refresh store list
          fetchStoreChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedStoreId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const callAdminFunction = async (action: string, params: any = {}) => {
    const { data, error } = await supabase.functions.invoke("admin", {
      body: { action, password: adminPassword, ...params },
    });
    if (error) throw error;
    return data;
  };

  const fetchStoreChats = async () => {
    setLoading(true);
    try {
      const data = await callAdminFunction("get_all_chats");
      setStoreChats(data.chats || []);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
    setLoading(false);
  };

  const fetchMessages = async (storeId: string) => {
    try {
      const data = await callAdminFunction("get_chats", { store_id: storeId });
      setMessages(data.messages || []);
      await callAdminFunction("mark_messages_read", { store_id: storeId });
      fetchStoreChats(); // Refresh unread counts
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSelectStore = async (storeId: string, storeName: string) => {
    setSelectedStoreId(storeId);
    setSelectedStoreName(storeName);
    await fetchMessages(storeId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedStoreId) return;
    
    try {
      await callAdminFunction("send_message", { 
        store_id: selectedStoreId, 
        message: newMessage 
      });
      setNewMessage("");
      fetchMessages(selectedStoreId);
    } catch (error) {
      toast({ title: "Error sending message", variant: "destructive" });
    }
  };

  const handleBack = () => {
    setSelectedStoreId(null);
    setSelectedStoreName("");
    setMessages([]);
  };

  const totalUnread = storeChats.reduce((sum, chat) => sum + chat.unread_count, 0);

  return (
    <div className="h-[600px] flex">
      {/* Store List */}
      <AnimatePresence mode="wait">
        {!selectedStoreId ? (
          <motion.div
            key="store-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Messages
              </h3>
              {totalUnread > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <Bell className="h-3 w-3" />
                  {totalUnread} unread
                </Badge>
              )}
            </div>

            <ScrollArea className="h-[540px]">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-secondary/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : storeChats.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {storeChats.map((chat) => (
                    <Card
                      key={chat.store_id}
                      className={`p-3 cursor-pointer transition-colors hover:bg-secondary/50 ${
                        chat.unread_count > 0 ? "border-primary/30 bg-primary/5" : ""
                      }`}
                      onClick={() => handleSelectStore(chat.store_id, chat.store_name)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Store className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{chat.store_name}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {chat.last_message}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">
                            {new Date(chat.last_message_time).toLocaleDateString()}
                          </p>
                          {chat.unread_count > 0 && (
                            <Badge className="mt-1">{chat.unread_count}</Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        ) : (
          <motion.div
            key="chat-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col"
          >
            {/* Chat Header */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{selectedStoreName}</p>
                <p className="text-xs text-muted-foreground">Seller Chat</p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 mb-4">
              <div className="space-y-2 pr-4">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-lg p-3 max-w-[80%] ${
                        msg.sender_type === "admin"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "mr-auto bg-secondary"
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminChatPanel;