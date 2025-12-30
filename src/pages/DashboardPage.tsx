import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  User, Store, Package, Plus, Edit2, Trash2, 
  ArrowLeft, Camera, Save, X, ImagePlus 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, formatPrice } from "@/lib/types";
import type { Store as StoreType, Product, Profile } from "@/lib/types";
import ImageUpload from "@/components/ImageUpload";
import { useImageUpload } from "@/hooks/useImageUpload";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [store, setStore] = useState<StoreType | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  
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
  });

  // Product form state
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    images: [] as string[],
    in_stock: true,
  });
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const { uploadImage, uploading: imageUploading } = useImageUpload();

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
      .single();

    if (storeData) {
      setStore(storeData as StoreType);
      setStoreForm({
        name: storeData.name,
        description: storeData.description || "",
        phone: storeData.phone,
        whatsapp: storeData.whatsapp,
        address: storeData.address,
        category: storeData.category,
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

  const openProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        category: product.category || "",
        images: product.images || [],
        in_stock: product.in_stock,
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        category: "",
        images: [],
        in_stock: true,
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
      images: productForm.images.filter(img => img.trim() !== ""),
      in_stock: productForm.in_stock,
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
              <Button onClick={() => navigate(`/store/${store.id}`)} variant="outline" className="gap-2">
                <Store className="h-4 w-4" />
                View My Store
              </Button>
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
                            <select
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={storeForm.category}
                              onChange={(e) => setStoreForm(prev => ({ ...prev, category: e.target.value }))}
                            >
                              {CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.icon} {cat.name}
                                </option>
                              ))}
                            </select>
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
                              <Label>Category</Label>
                              <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-10"
                                value={productForm.category}
                                onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                              >
                                <option value="">Select category</option>
                                {CATEGORIES.map(cat => (
                                  <option key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
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
                      {products.map((product) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group relative rounded-xl border bg-card overflow-hidden"
                        >
                          <div className="aspect-square bg-secondary">
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
                          </div>
                          <div className="p-4">
                            <h4 className="font-medium truncate">{product.name}</h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {product.description || "No description"}
                            </p>
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
                                variant="ghost" 
                                size="sm" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;