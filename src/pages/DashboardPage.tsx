import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  User, Store, Package, Plus, Edit2, Trash2, 
  ArrowLeft, Camera, Save, X, ImagePlus, Eye, EyeOff, Tags, FolderPlus
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SellerChatWidget from "@/components/SellerChatWidget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, formatPrice } from "@/lib/types";
import type { Store as StoreType, Product, Profile } from "@/lib/types";
import ImageUpload from "@/components/ImageUpload";
import { useImageUpload } from "@/hooks/useImageUpload";

interface StoreCategory {
  id: string;
  name: string;
  store_id: string;
  created_at: string;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [store, setStore] = useState<StoreType | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [storeCategories, setStoreCategories] = useState<StoreCategory[]>([]);
  
  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
  });

  // Store editing state
  const [editingStore, setEditingStore] = useState(false);
  const [storeForm, setStoreForm] = useState({
    name: "",
    description: "",
    phone: "",
    whatsapp: "",
    address: "",
    category: "",
    is_visible: true,
  });

  // Product form state
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    store_category_id: "",
    images: [] as string[],
    in_stock: true,
    is_hidden: false,
  });
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const { uploadImage, uploading: imageUploading } = useImageUpload();

  // Store category form
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUserId(session?.user?.id || null);
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    if (!userId) return;
    setIsLoading(true);

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileData) {
      setProfile(profileData as Profile);
      setProfileForm({
        full_name: profileData.full_name || "",
        phone: profileData.phone || "",
      });
    }

    // Fetch store
    const { data: storeData } = await supabase
      .from("stores")
      .select("*")
      .eq("owner_id", userId)
      .maybeSingle();

    if (storeData) {
      setStore(storeData as StoreType);
      setStoreForm({
        name: storeData.name,
        description: storeData.description || "",
        phone: storeData.phone,
        whatsapp: storeData.whatsapp,
        address: storeData.address,
        category: storeData.category,
        is_visible: storeData.is_visible ?? true,
      });

      // Fetch products
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", storeData.id)
        .order("created_at", { ascending: false });

      if (productsData) {
        setProducts(productsData as Product[]);
      }

      // Fetch store categories
      const { data: categoriesData } = await supabase
        .from("store_categories")
        .select("*")
        .eq("store_id", storeData.id)
        .order("name", { ascending: true });

      if (categoriesData) {
        setStoreCategories(categoriesData as StoreCategory[]);
      }
    }

    setIsLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profileForm.full_name,
        phone: profileForm.phone,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
      setEditingProfile(false);
      fetchUserData();
    }
  };

  const handleProfileImageUpload = async (file: File) => {
    if (!userId || !profile) return;
    
    const url = await uploadImage(file, "avatars", userId);
    if (url) {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("user_id", userId);

      if (!error) {
        toast({ title: "Profile picture updated!" });
        fetchUserData();
      }
    }
  };

  const handleStoreCoverUpload = async (file: File) => {
    if (!store) return;
    
    const url = await uploadImage(file, "covers", store.id);
    if (url) {
      const { error } = await supabase
        .from("stores")
        .update({ cover_image: url })
        .eq("id", store.id);

      if (!error) {
        toast({ title: "Cover image updated!" });
        fetchUserData();
      }
    }
  };

  const handleStoreLogoUpload = async (file: File) => {
    if (!store) return;
    
    const url = await uploadImage(file, "logos", store.id);
    if (url) {
      const { error } = await supabase
        .from("stores")
        .update({ logo: url })
        .eq("id", store.id);

      if (!error) {
        toast({ title: "Store logo updated!" });
        fetchUserData();
      }
    }
  };

  const handleSaveStore = async () => {
    if (!store) return;
    
    const { error } = await supabase
      .from("stores")
      .update({
        name: storeForm.name,
        description: storeForm.description,
        phone: storeForm.phone,
        whatsapp: storeForm.whatsapp,
        address: storeForm.address,
        category: storeForm.category,
        is_visible: storeForm.is_visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", store.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Store updated!" });
      setEditingStore(false);
      fetchUserData();
    }
  };

  const handleToggleStoreVisibility = async () => {
    if (!store) return;
    
    const newVisibility = !store.is_visible;
    const { error } = await supabase
      .from("stores")
      .update({ is_visible: newVisibility })
      .eq("id", store.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ 
        title: newVisibility ? "Store is now visible" : "Store is now hidden",
        description: newVisibility 
          ? "Customers can now see your store" 
          : "Your store is hidden from customers"
      });
      fetchUserData();
    }
  };

  const openProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        category: product.category || "",
        store_category_id: (product as any).store_category_id || "",
        images: product.images || [],
        in_stock: product.in_stock,
        is_hidden: (product as any).is_hidden || false,
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        category: "",
        store_category_id: "",
        images: [],
        in_stock: true,
        is_hidden: false,
      });
    }
    setShowProductDialog(true);
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!store || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "File size must be less than 5MB", variant: "destructive" });
      return;
    }

    setUploadingProductImage(true);
    const url = await uploadImage(file, "products", store.id);
    if (url) {
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, url],
      }));
      toast({ title: "Image uploaded!" });
    }
    setUploadingProductImage(false);
    
    // Reset input
    e.target.value = "";
  };

  const removeProductImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSaveProduct = async () => {
    if (!store) return;
    setSavingProduct(true);

    const productData = {
      store_id: store.id,
      name: productForm.name,
      description: productForm.description || null,
      price: parseFloat(productForm.price) || 0,
      category: productForm.category || null,
      store_category_id: productForm.store_category_id || null,
      images: productForm.images.filter(img => img.trim() !== ""),
      in_stock: productForm.in_stock,
      is_hidden: productForm.is_hidden,
    };

    let error;
    if (editingProduct) {
      const result = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("products")
        .insert(productData);
      error = result.error;
    }

    setSavingProduct(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingProduct ? "Product updated!" : "Product added!" });
      setShowProductDialog(false);
      fetchUserData();
    }
  };

  const handleToggleProductVisibility = async (productId: string, currentHidden: boolean) => {
    const { error } = await supabase
      .from("products")
      .update({ is_hidden: !currentHidden })
      .eq("id", productId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ 
        title: currentHidden ? "Product is now visible" : "Product is now hidden" 
      });
      fetchUserData();
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product deleted!" });
      fetchUserData();
    }
  };

  // Store category management
  const handleAddCategory = async () => {
    if (!store || !newCategoryName.trim()) return;
    setSavingCategory(true);

    const { error } = await supabase
      .from("store_categories")
      .insert({
        store_id: store.id,
        name: newCategoryName.trim(),
      });

    setSavingCategory(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Category added!" });
      setNewCategoryName("");
      setShowCategoryDialog(false);
      fetchUserData();
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const { error } = await supabase
      .from("store_categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Category deleted!" });
      fetchUserData();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-secondary/30 py-6 md:py-8">
        <div className="container">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">Seller Dashboard</h1>
              <p className="text-muted-foreground">Manage your store and products</p>
            </div>
            {store && (
              <div className="flex items-center gap-3">
                {/* Store visibility toggle */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border">
                  {store.is_visible ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">Store {store.is_visible ? "Visible" : "Hidden"}</span>
                  <Switch
                    checked={store.is_visible}
                    onCheckedChange={handleToggleStoreVisibility}
                  />
                </div>
                <Button onClick={() => navigate(`/store/${store.id}`)} variant="outline" className="gap-2">
                  <Store className="h-4 w-4" />
                  View My Store
                </Button>
              </div>
            )}
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6 w-full justify-start overflow-x-auto">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="store" className="gap-2">
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">Store</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Products</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="gap-2">
                <Tags className="h-4 w-4" />
                <span className="hidden sm:inline">Categories</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>Manage your personal information</CardDescription>
                  </div>
                  <Button
                    variant={editingProfile ? "secondary" : "outline"}
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="gap-2"
                  >
                    {editingProfile ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                    {editingProfile ? "Cancel" : "Edit"}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                    <div className="space-y-2 text-center">
                      <Label>Profile Picture</Label>
                      <ImageUpload
                        currentImage={profile?.avatar_url}
                        onUpload={handleProfileImageUpload}
                        uploading={imageUploading}
                        variant="avatar"
                      />
                    </div>
                    <div className="flex-1 grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        {editingProfile ? (
                          <Input
                            value={profileForm.full_name}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                          />
                        ) : (
                          <p className="text-foreground">{profile?.full_name || "Not set"}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <p className="text-foreground">{profile?.email || "Not set"}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        {editingProfile ? (
                          <Input
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="+250..."
                          />
                        ) : (
                          <p className="text-foreground">{profile?.phone || "Not set"}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {editingProfile && (
                    <Button onClick={handleSaveProfile} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Store Tab */}
            <TabsContent value="store">
              {store ? (
                <Card>
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Your Store</CardTitle>
                      <CardDescription>Manage store information</CardDescription>
                    </div>
                    <Button
                      variant={editingStore ? "secondary" : "outline"}
                      onClick={() => setEditingStore(!editingStore)}
                      className="gap-2"
                    >
                      {editingStore ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                      {editingStore ? "Cancel" : "Edit"}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Store Images */}
                    <div className="space-y-4">
                      <Label>Store Cover Image</Label>
                      <ImageUpload
                        currentImage={store.cover_image}
                        onUpload={handleStoreCoverUpload}
                        uploading={imageUploading}
                        variant="cover"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="space-y-2">
                        <Label>Store Logo</Label>
                        <ImageUpload
                          currentImage={store.logo}
                          onUpload={handleStoreLogoUpload}
                          uploading={imageUploading}
                          variant="logo"
                        />
                      </div>
                      <div className="flex-1 grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Store Name</Label>
                          {editingStore ? (
                            <Input
                              value={storeForm.name}
                              onChange={(e) => setStoreForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                          ) : (
                            <p className="text-foreground">{store.name}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          {editingStore ? (
                            <Select
                              value={storeForm.category}
                              onValueChange={(value) => setStoreForm(prev => ({ ...prev, category: value }))}
                            >
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIES.map(cat => (
                                  <SelectItem key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="text-foreground">
                              {CATEGORIES.find(c => c.id === store.category)?.name || store.category}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      {editingStore ? (
                        <Textarea
                          value={storeForm.description}
                          onChange={(e) => setStoreForm(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      ) : (
                        <p className="text-foreground">{store.description || "No description"}</p>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        {editingStore ? (
                          <Input
                            value={storeForm.phone}
                            onChange={(e) => setStoreForm(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        ) : (
                          <p className="text-foreground">{store.phone}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>WhatsApp</Label>
                        {editingStore ? (
                          <Input
                            value={storeForm.whatsapp}
                            onChange={(e) => setStoreForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                          />
                        ) : (
                          <p className="text-foreground">{store.whatsapp}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      {editingStore ? (
                        <Input
                          value={storeForm.address}
                          onChange={(e) => setStoreForm(prev => ({ ...prev, address: e.target.value }))}
                        />
                      ) : (
                        <p className="text-foreground">{store.address}</p>
                      )}
                    </div>
                    {editingStore && (
                      <Button onClick={handleSaveStore} className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No store yet</h3>
                    <p className="text-muted-foreground mb-4">Create your store to start selling</p>
                    <Button onClick={() => navigate("/create-store")} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Store
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Your Products</CardTitle>
                    <CardDescription>{products.length} product{products.length !== 1 ? "s" : ""}</CardDescription>
                  </div>
                  {store && (
                    <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                      <DialogTrigger asChild>
                        <Button onClick={() => openProductDialog()} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add Product
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {editingProduct ? "Edit Product" : "Add New Product"}
                          </DialogTitle>
                          <DialogDescription>
                            {editingProduct 
                              ? "Update your product details" 
                              : "Add a new product to your store"}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Product Name *</Label>
                            <Input
                              value={productForm.name}
                              onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g., iPhone 15 Pro"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={productForm.description}
                              onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Describe your product..."
                              rows={3}
                            />
                          </div>
                          <div className="grid gap-4 grid-cols-2">
                            <div className="space-y-2">
                              <Label>Price (RWF) *</Label>
                              <Input
                                type="number"
                                value={productForm.price}
                                onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                                placeholder="0"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Global Category</Label>
                              <Select
                                value={productForm.category}
                                onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}
                              >
                                <SelectTrigger className="bg-background">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {CATEGORIES.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                      {cat.icon} {cat.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          {storeCategories.length > 0 && (
                            <div className="space-y-2">
                              <Label>Store Category</Label>
                              <Select
                                value={productForm.store_category_id}
                                onValueChange={(value) => setProductForm(prev => ({ ...prev, store_category_id: value }))}
                              >
                                <SelectTrigger className="bg-background">
                                  <SelectValue placeholder="Select your store category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">None</SelectItem>
                                  {storeCategories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                      {cat.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">
                                Your custom category to organize products within your store
                              </p>
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="in_stock"
                                checked={productForm.in_stock}
                                onChange={(e) => setProductForm(prev => ({ ...prev, in_stock: e.target.checked }))}
                                className="h-4 w-4 rounded border-input"
                              />
                              <Label htmlFor="in_stock" className="cursor-pointer">In Stock</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor="is_hidden" className="cursor-pointer text-muted-foreground">Hide Product</Label>
                              <Switch
                                id="is_hidden"
                                checked={productForm.is_hidden}
                                onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, is_hidden: checked }))}
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <Label>Product Images</Label>
                            
                            {/* Image preview grid */}
                            {productForm.images.length > 0 && (
                              <div className="grid grid-cols-3 gap-2">
                                {productForm.images.map((img, index) => (
                                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-secondary">
                                    <img
                                      src={img}
                                      alt={`Product ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      onClick={() => removeProductImage(index)}
                                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Upload button */}
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleProductImageUpload}
                                className="hidden"
                                id="product-image-upload"
                                disabled={uploadingProductImage}
                              />
                              <label
                                htmlFor="product-image-upload"
                                className={`inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer ${uploadingProductImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {uploadingProductImage ? (
                                  <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <ImagePlus className="h-4 w-4" />
                                    Add Image
                                  </>
                                )}
                              </label>
                            </div>
                            
                            <p className="text-xs text-muted-foreground">
                              Upload images from your device (max 5MB each)
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button 
                            onClick={handleSaveProduct} 
                            disabled={savingProduct || !productForm.name || !productForm.price}
                          >
                            {savingProduct ? "Saving..." : (editingProduct ? "Update" : "Add Product")}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardHeader>
                <CardContent>
                  {!store ? (
                    <div className="py-12 text-center">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Create a store first to add products</p>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="py-12 text-center">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No products yet</p>
                      <Button onClick={() => openProductDialog()} variant="outline" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Your First Product
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {products.map((product) => {
                        const isHidden = (product as any).is_hidden;
                        const storeCategory = storeCategories.find(c => c.id === (product as any).store_category_id);
                        
                        return (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`group relative rounded-xl border bg-card overflow-hidden ${isHidden ? 'opacity-60' : ''}`}
                          >
                            <div className="aspect-square bg-secondary relative">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                              {isHidden && (
                                <div className="absolute top-2 left-2">
                                  <Badge variant="secondary" className="gap-1">
                                    <EyeOff className="h-3 w-3" />
                                    Hidden
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h4 className="font-medium truncate">{product.name}</h4>
                              <p className="text-sm text-muted-foreground truncate">
                                {product.description || "No description"}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {product.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {CATEGORIES.find(c => c.id === product.category)?.icon} {CATEGORIES.find(c => c.id === product.category)?.name}
                                  </Badge>
                                )}
                                {storeCategory && (
                                  <Badge variant="secondary" className="text-xs">
                                    {storeCategory.name}
                                  </Badge>
                                )}
                              </div>
                              <div className="mt-2 flex items-center justify-between">
                                <span className="font-semibold text-primary">
                                  {formatPrice(product.price, product.currency)}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  product.in_stock 
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                }`}>
                                  {product.in_stock ? "In Stock" : "Out of Stock"}
                                </span>
                              </div>
                              <div className="mt-3 flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1 gap-1"
                                  onClick={() => openProductDialog(product)}
                                >
                                  <Edit2 className="h-3 w-3" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => handleToggleProductVisibility(product.id, isHidden)}
                                >
                                  {isHidden ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Store Categories Tab */}
            <TabsContent value="categories">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Store Categories</CardTitle>
                    <CardDescription>
                      Create custom categories to organize your products (e.g., Suits, Shoes, Accessories)
                    </CardDescription>
                  </div>
                  {store && (
                    <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <FolderPlus className="h-4 w-4" />
                          Add Category
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Category</DialogTitle>
                          <DialogDescription>
                            Create a custom category to organize your products
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Category Name</Label>
                            <Input
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              placeholder="e.g., Suits, Shoes, Accessories"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button 
                            onClick={handleAddCategory}
                            disabled={savingCategory || !newCategoryName.trim()}
                          >
                            {savingCategory ? "Adding..." : "Add Category"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardHeader>
                <CardContent>
                  {!store ? (
                    <div className="py-12 text-center">
                      <Tags className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Create a store first to add categories</p>
                    </div>
                  ) : storeCategories.length === 0 ? (
                    <div className="py-12 text-center">
                      <Tags className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No categories yet</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Categories help organize your products and make your store more searchable
                      </p>
                      <Button onClick={() => setShowCategoryDialog(true)} variant="outline" className="gap-2">
                        <FolderPlus className="h-4 w-4" />
                        Add Your First Category
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {storeCategories.map((category) => {
                        const productCount = products.filter(p => (p as any).store_category_id === category.id).length;
                        
                        return (
                          <div
                            key={category.id}
                            className="flex items-center justify-between p-4 rounded-lg border bg-background"
                          >
                            <div>
                              <h4 className="font-medium">{category.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {productCount} product{productCount !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* Seller Chat Widget */}
      {store && <SellerChatWidget storeId={store.id} />}
    </div>
  );
};

export default DashboardPage;