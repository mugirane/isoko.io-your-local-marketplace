import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Store, Users, MessageCircle, CreditCard, FileText,
  Lock, Unlock, Search, Send, Bell, X, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StoreWithInfo {
  id: string;
  name: string;
  owner_name: string;
  email: string;
  phone: string;
  category: string;
  is_active: boolean;
  is_visible: boolean;
  created_at: string;
  followers_count: number;
  latest_payment: {
    id: string;
    amount: number;
    due_date: string;
    is_paid: boolean;
    paid_at: string | null;
  } | null;
  notes: Array<{
    id: string;
    note: string;
    created_at: string;
  }>;
}

interface ChatMessage {
  id: string;
  sender_type: "admin" | "seller";
  message: string;
  created_at: string;
}

const AdminPortal = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [stores, setStores] = useState<StoreWithInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState<StoreWithInfo | null>(null);
  const [newNote, setNewNote] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [duePayments, setDuePayments] = useState<any[]>([]);

  const adminPassword = "29042006";

  const handleLogin = () => {
    if (password === adminPassword) {
      setIsAuthenticated(true);
      localStorage.setItem("admin_session", "true");
      fetchStores();
    } else {
      toast({ title: "Invalid password", variant: "destructive" });
    }
  };

  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    if (session === "true") {
      setIsAuthenticated(true);
      fetchStores();
    }
  }, []);

  const callAdminFunction = async (action: string, params: any = {}) => {
    const { data, error } = await supabase.functions.invoke("admin", {
      body: { action, password: adminPassword, ...params },
    });
    if (error) throw error;
    return data;
  };

  const fetchStores = async () => {
    setLoading(true);
    try {
      const data = await callAdminFunction("get_stores");
      setStores(data.stores || []);
      
      const dueData = await callAdminFunction("get_due_payments");
      setDuePayments(dueData.payments || []);
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast({ title: "Error loading data", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleFreezeStore = async (storeId: string, freeze: boolean) => {
    try {
      await callAdminFunction("freeze_store", { store_id: storeId, is_active: !freeze });
      toast({ title: freeze ? "Store frozen" : "Store unfrozen" });
      fetchStores();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleAddNote = async (storeId: string) => {
    if (!newNote.trim()) return;
    try {
      await callAdminFunction("add_note", { store_id: storeId, note: newNote });
      toast({ title: "Note added" });
      setNewNote("");
      fetchStores();
    } catch (error) {
      toast({ title: "Error adding note", variant: "destructive" });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await callAdminFunction("delete_note", { note_id: noteId });
      toast({ title: "Note deleted" });
      fetchStores();
    } catch (error) {
      toast({ title: "Error deleting note", variant: "destructive" });
    }
  };

  const handleCreatePayment = async (storeId: string) => {
    try {
      await callAdminFunction("create_payment", { store_id: storeId });
      toast({ title: "Payment reminder created" });
      fetchStores();
    } catch (error) {
      toast({ title: "Error creating payment", variant: "destructive" });
    }
  };

  const handleMarkPaid = async (paymentId: string) => {
    try {
      await callAdminFunction("mark_paid", { payment_id: paymentId });
      toast({ title: "Payment marked as paid" });
      fetchStores();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const fetchChat = async (storeId: string) => {
    try {
      const data = await callAdminFunction("get_chats", { store_id: storeId });
      setChatMessages(data.messages || []);
      await callAdminFunction("mark_messages_read", { store_id: storeId });
    } catch (error) {
      console.error("Error fetching chat:", error);
    }
  };

  const handleSendMessage = async (storeId: string) => {
    if (!newMessage.trim()) return;
    try {
      await callAdminFunction("send_message", { store_id: storeId, message: newMessage });
      setNewMessage("");
      fetchChat(storeId);
    } catch (error) {
      toast({ title: "Error sending message", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    setIsAuthenticated(false);
    navigate("/");
  };

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Lock className="h-5 w-5" />
                Admin Portal
              </CardTitle>
              <CardDescription>Enter the admin password to continue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <Button onClick={handleLogin} className="w-full">
                Login
              </Button>
              <Button variant="ghost" onClick={() => navigate("/")} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold">Admin Portal</h1>
          <div className="flex items-center gap-4">
            {duePayments.length > 0 && (
              <Badge variant="destructive" className="gap-1">
                <Bell className="h-3 w-3" />
                {duePayments.length} payments due
              </Badge>
            )}
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Payment Notice */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-sm">
              <strong>Monthly Payment:</strong> 8,000 RWF | <strong>MoMo Code:</strong> 1794847
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="stores">
          <TabsList className="mb-6">
            <TabsTrigger value="stores" className="gap-2">
              <Store className="h-4 w-4" />
              Stores ({stores.length})
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Due Payments ({duePayments.length})
            </TabsTrigger>
            <TabsTrigger value="chats" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Messages
            </TabsTrigger>
          </TabsList>

          {/* Stores Tab */}
          <TabsContent value="stores">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStores.map((store) => (
                  <Card key={store.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{store.name}</h3>
                            {!store.is_active && (
                              <Badge variant="destructive">Frozen</Badge>
                            )}
                            {!store.is_visible && (
                              <Badge variant="secondary">Hidden by owner</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {store.owner_name} • {store.email} • {store.phone}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Category: {store.category} • Followers: {store.followers_count}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined: {new Date(store.created_at).toLocaleDateString()}
                          </p>

                          {/* Payment Status */}
                          {store.latest_payment && (
                            <div className="mt-2">
                              <Badge variant={store.latest_payment.is_paid ? "default" : "destructive"}>
                                {store.latest_payment.is_paid
                                  ? `Paid on ${new Date(store.latest_payment.paid_at!).toLocaleDateString()}`
                                  : `Due: ${new Date(store.latest_payment.due_date).toLocaleDateString()}`}
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant={store.is_active ? "destructive" : "default"}
                            onClick={() => handleFreezeStore(store.id, store.is_active)}
                          >
                            {store.is_active ? (
                              <>
                                <Lock className="mr-1 h-3 w-3" /> Freeze
                              </>
                            ) : (
                              <>
                                <Unlock className="mr-1 h-3 w-3" /> Unfreeze
                              </>
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCreatePayment(store.id)}
                          >
                            <CreditCard className="mr-1 h-3 w-3" /> Add Payment
                          </Button>

                          {store.latest_payment && !store.latest_payment.is_paid && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleMarkPaid(store.latest_payment!.id)}
                            >
                              Mark Paid
                            </Button>
                          )}

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <FileText className="mr-1 h-3 w-3" /> Notes ({store.notes.length})
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Notes for {store.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="flex gap-2">
                                  <Textarea
                                    placeholder="Add a note..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                  />
                                  <Button onClick={() => handleAddNote(store.id)}>Add</Button>
                                </div>
                                <div className="max-h-64 space-y-2 overflow-y-auto">
                                  {store.notes.map((note) => (
                                    <div
                                      key={note.id}
                                      className="flex items-start justify-between rounded bg-secondary p-2"
                                    >
                                      <div>
                                        <p className="text-sm">{note.note}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(note.created_at).toLocaleString()}
                                        </p>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteNote(note.id)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => fetchChat(store.id)}
                              >
                                <MessageCircle className="mr-1 h-3 w-3" /> Chat
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>Chat with {store.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="h-64 overflow-y-auto space-y-2 rounded border p-2">
                                  {chatMessages.map((msg) => (
                                    <div
                                      key={msg.id}
                                      className={`rounded p-2 ${
                                        msg.sender_type === "admin"
                                          ? "ml-8 bg-primary text-primary-foreground"
                                          : "mr-8 bg-secondary"
                                      }`}
                                    >
                                      <p className="text-sm">{msg.message}</p>
                                      <p className="text-xs opacity-70">
                                        {new Date(msg.created_at).toLocaleString()}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) =>
                                      e.key === "Enter" && handleSendMessage(store.id)
                                    }
                                  />
                                  <Button onClick={() => handleSendMessage(store.id)}>
                                    <Send className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Due Payments Tab */}
          <TabsContent value="payments">
            {duePayments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">No payments due</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {duePayments.map((payment) => (
                  <Card key={payment.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <h3 className="font-semibold">{payment.stores?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {payment.stores?.email} • {payment.stores?.phone}
                        </p>
                        <p className="text-sm">
                          Amount: {payment.amount.toLocaleString()} RWF •
                          Due: {new Date(payment.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button onClick={() => handleMarkPaid(payment.id)}>
                        Mark Paid
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Chats Tab */}
          <TabsContent value="chats">
            <Card>
              <CardContent className="p-4">
                <p className="text-center text-muted-foreground">
                  Select a store from the Stores tab to view and send messages
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPortal;
