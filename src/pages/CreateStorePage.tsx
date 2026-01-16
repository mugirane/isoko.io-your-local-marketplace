import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Store, MapPin, Phone, Mail, User, Package, ArrowRight, ArrowLeft, Check, Gift, Clock, Globe, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CATEGORIES, CURRENCIES } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import PhoneInput from "@/components/PhoneInput";

const CreateStorePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // Start at 0 for auth step
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [promoCodeValid, setPromoCodeValid] = useState<boolean | null>(null);
  const [affiliateId, setAffiliateId] = useState<string | null>(null);
  const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    whatsapp: "",
    description: "",
    category: "",
    address: "",
    promoCode: "",
    currency: "RWF",
    subdomain: "",
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUserId(session?.user?.id || null);
        // Auto-advance to step 1 if logged in
        if (session?.user && step === 0) {
          setStep(1);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
      if (session?.user) {
        setStep(1);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Generate subdomain from business name
  const generateSubdomain = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  // Debounced subdomain check
  const subdomainCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Check subdomain availability with debounce
  const checkSubdomainAvailability = (subdomain: string) => {
    if (subdomainCheckTimeout.current) {
      clearTimeout(subdomainCheckTimeout.current);
    }
    
    if (!subdomain || subdomain.length < 2) {
      setSubdomainStatus('idle');
      return;
    }
    
    setSubdomainStatus('checking');
    
    subdomainCheckTimeout.current = setTimeout(async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("id")
        .eq("subdomain", subdomain)
        .maybeSingle();
      
      if (error) {
        setSubdomainStatus('idle');
        return;
      }
      
      setSubdomainStatus(data ? 'taken' : 'available');
    }, 500); // 500ms debounce
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate subdomain when business name changes (only if subdomain hasn't been manually edited)
      if (field === "businessName" && prev.subdomain === generateSubdomain(prev.businessName)) {
        updated.subdomain = generateSubdomain(value);
      }
      
      return updated;
    });
    
    // Reset promo code validation when changed
    if (field === "promoCode") {
      setPromoCodeValid(null);
      setAffiliateId(null);
    }
    
    // Check subdomain availability when it changes
    if (field === "subdomain") {
      const cleanSubdomain = generateSubdomain(value);
      checkSubdomainAvailability(cleanSubdomain);
    }
    
    // Also check when business name changes and subdomain follows
    if (field === "businessName") {
      const newSubdomain = generateSubdomain(value);
      if (formData.subdomain === generateSubdomain(formData.businessName) || !formData.subdomain) {
        checkSubdomainAvailability(newSubdomain);
      }
    }
  };

  const validatePromoCode = async () => {
    if (!formData.promoCode.trim()) {
      setPromoCodeValid(null);
      setAffiliateId(null);
      return;
    }

    const { data } = await supabase
      .from("affiliates")
      .select("id")
      .eq("promo_code", formData.promoCode.trim().toUpperCase())
      .eq("is_active", true)
      .maybeSingle();

    if (data) {
      setPromoCodeValid(true);
      setAffiliateId(data.id);
      toast({ title: "Promo code valid! ✓" });
    } else {
      setPromoCodeValid(false);
      setAffiliateId(null);
      toast({ title: "Invalid promo code", variant: "destructive" });
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.businessName || !formData.ownerName || !formData.email || !formData.phone) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      // Validate subdomain
      if (!formData.subdomain || formData.subdomain.length < 2) {
        toast({
          title: "Invalid subdomain",
          description: "Please enter a valid subdomain (at least 2 characters)",
          variant: "destructive",
        });
        return;
      }
      if (subdomainStatus === 'taken') {
        toast({
          title: "Subdomain taken",
          description: "Please choose a different subdomain",
          variant: "destructive",
        });
        return;
      }
      if (subdomainStatus === 'checking') {
        toast({
          title: "Please wait",
          description: "Checking subdomain availability...",
          variant: "destructive",
        });
        return;
      }
    }
    if (step === 2) {
      if (!formData.description || !formData.category || !formData.address) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to create a store.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsLoading(true);

    const storeData: any = {
      owner_id: userId,
      name: formData.businessName,
      subdomain: generateSubdomain(formData.subdomain),
      description: formData.description,
      owner_name: formData.ownerName,
      email: formData.email,
      phone: formData.phone,
      whatsapp: formData.whatsapp || formData.phone,
      address: formData.address,
      category: formData.category,
      currency: formData.currency,
    };

    // Add affiliate reference if promo code is valid
    if (affiliateId) {
      storeData.referred_by_affiliate_id = affiliateId;
    }

    const { data, error } = await supabase
      .from("stores")
      .insert(storeData)
      .select()
      .single();

    setIsLoading(false);

    if (error) {
      toast({
        title: "Error creating store",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Store Created! 🎉",
        description: "Your store has been created successfully.",
      });
      navigate(`/store/${data.id}`);
    }
  };

  const selectedCategory = CATEGORIES.find((c) => c.id === formData.category);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-secondary/30 py-12 pb-24 md:pb-12">
        <div className="container max-w-3xl">
          {/* Free Trial Notice */}
          <Alert className="mb-6 border-green-500/30 bg-green-500/10">
            <Clock className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <strong>🎉 New sellers get 3 weeks free trial!</strong> After that, only 8,000 RWF/month. No payment required to start.
            </AlertDescription>
          </Alert>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4">
              {[0, 1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-colors ${
                      step >= s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > s ? <Check className="h-5 w-5" /> : s}
                  </div>
                  <span className={`hidden sm:block text-sm ${step >= s ? "font-medium" : "text-muted-foreground"}`}>
                    {s === 0 && "Sign Up"}
                    {s === 1 && "Business Info"}
                    {s === 2 && "Store Details"}
                    {s === 3 && "Preview"}
                  </span>
                  {s < 3 && <div className="hidden sm:block w-12 h-0.5 bg-muted" />}
                </div>
              ))}
            </div>
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Step 0: Sign Up First */}
            {step === 0 && (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Create Your Account First
                  </CardTitle>
                  <CardDescription>
                    Sign up or sign in to start creating your store
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <Store className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Ready to open your store?</h3>
                    <p className="text-muted-foreground mb-6">
                      Create an account to manage your store, add products, and connect with customers.
                    </p>
                    <Button onClick={() => navigate("/auth")} className="gap-2">
                      Sign Up / Sign In
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 1: Business Info */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Business Information
                  </CardTitle>
                  <CardDescription>
                    Tell us about you and your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        placeholder="e.g., TechHub Rwanda"
                        value={formData.businessName}
                        onChange={(e) => updateFormData("businessName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownerName">Owner Name *</Label>
                      <Input
                        id="ownerName"
                        placeholder="Your full name"
                        value={formData.ownerName}
                        onChange={(e) => updateFormData("ownerName", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Store Subdomain Field */}
                  <div className="space-y-2">
                    <Label htmlFor="subdomain" className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      Store Subdomain *
                    </Label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="subdomain"
                          placeholder="your-store-name"
                          value={formData.subdomain}
                          onChange={(e) => updateFormData("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          className={`pr-10 ${
                            subdomainStatus === 'available' ? 'border-green-500 focus-visible:ring-green-500' : 
                            subdomainStatus === 'taken' ? 'border-red-500 focus-visible:ring-red-500' : ''
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {subdomainStatus === 'checking' && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                          {subdomainStatus === 'available' && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                          {subdomainStatus === 'taken' && (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your store will be available at: <span className="font-medium text-foreground">{formData.subdomain || 'your-store'}.isoko.store</span>
                    </p>
                    {subdomainStatus === 'available' && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> This subdomain is available!
                      </p>
                    )}
                    {subdomainStatus === 'taken' && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> This subdomain is already taken
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <PhoneInput
                        id="phone"
                        value={formData.phone}
                        onChange={(value) => updateFormData("phone", value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp Number</Label>
                      <PhoneInput
                        id="whatsapp"
                        value={formData.whatsapp}
                        onChange={(value) => updateFormData("whatsapp", value)}
                        placeholder="Same as phone if empty"
                      />
                    </div>
                  </div>

                  {/* Promo Code Field */}
                  <div className="space-y-2">
                    <Label htmlFor="promoCode" className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-primary" />
                      Promo Code (Optional)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="promoCode"
                        placeholder="Enter affiliate promo code"
                        value={formData.promoCode}
                        onChange={(e) => updateFormData("promoCode", e.target.value.toUpperCase())}
                        className={promoCodeValid === true ? "border-green-500" : promoCodeValid === false ? "border-red-500" : ""}
                      />
                      <Button type="button" variant="outline" onClick={validatePromoCode}>
                        Validate
                      </Button>
                    </div>
                    {promoCodeValid === true && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <Check className="h-4 w-4" /> Valid promo code applied!
                      </p>
                    )}
                    {promoCodeValid === false && (
                      <p className="text-sm text-red-600">Invalid or expired promo code</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Store Details */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-primary" />
                    Store Details
                  </CardTitle>
                  <CardDescription>
                    Describe your store and what you sell
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Store Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell customers what makes your store special..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => updateFormData("description", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {CATEGORIES.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => updateFormData("category", category.id)}
                          className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-all ${
                            formData.category === category.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span>{category.icon}</span>
                          <span className="truncate">{category.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Store Location *</Label>
                    <Input
                      id="address"
                      placeholder="Street address, city"
                      value={formData.address}
                      onChange={(e) => updateFormData("address", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Store Currency *</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => updateFormData("currency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.symbol} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      This will be the default currency for your products
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Preview */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Review Your Store
                  </CardTitle>
                  <CardDescription>
                    Make sure everything looks correct
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-2xl border bg-secondary/50 p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                        <Store className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">{formData.businessName}</h3>
                        <p className="text-sm text-muted-foreground">
                          by {formData.ownerName}
                        </p>
                        {selectedCategory && (
                          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                            {selectedCategory.icon} {selectedCategory.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="mt-4 text-muted-foreground">{formData.description}</p>

                    <div className="mt-6 space-y-2 text-sm">
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {formData.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {formData.phone}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {formData.address}
                      </p>
                      {affiliateId && (
                        <p className="flex items-center gap-2 text-green-600">
                          <Gift className="h-4 w-4" />
                          Referred by affiliate: {formData.promoCode}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {step < 3 ? (
              <Button onClick={handleNext} className="gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                variant="hero" 
                onClick={handleSubmit} 
                className="gap-2"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Store"}
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateStorePage;
