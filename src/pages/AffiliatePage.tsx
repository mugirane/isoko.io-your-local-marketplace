import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, Gift, Copy, Check, ArrowRight, DollarSign, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PhoneInput from "@/components/PhoneInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AffiliateData {
  id: string;
  promo_code: string;
  full_name: string;
  email: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

interface EarningData {
  id: string;
  amount: number;
  is_paid: boolean;
  created_at: string;
  stores: {
    name: string;
  } | null;
}

const AffiliatePage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [earnings, setEarnings] = useState<EarningData[]>([]);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUserId(session?.user?.id || null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
      if (!session?.user) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchAffiliateData();
    }
  }, [userId]);

  const fetchAffiliateData = async () => {
    if (!userId) return;
    setIsLoading(true);

    // Check if user is already an affiliate
    const { data: affiliateData } = await supabase
      .from("affiliates")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (affiliateData) {
      setAffiliate(affiliateData as AffiliateData);
      
      // Fetch earnings
      const { data: earningsData } = await supabase
        .from("affiliate_earnings")
        .select("*, stores(name)")
        .eq("affiliate_id", affiliateData.id)
        .order("created_at", { ascending: false });

      if (earningsData) {
        setEarnings(earningsData as EarningData[]);
      }
    }

    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to become an affiliate.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Generate promo code
    const { data: promoCode } = await supabase.rpc("generate_promo_code");

    const { error } = await supabase.from("affiliates").insert({
      user_id: userId,
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      promo_code: promoCode || `ISOKO${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome to the Affiliate Program! 🎉",
        description: "Your promo code has been generated.",
      });
      fetchAffiliateData();
    }
  };

  const copyPromoCode = () => {
    if (affiliate?.promo_code) {
      navigator.clipboard.writeText(affiliate.promo_code);
      setCopied(true);
      toast({ title: "Promo code copied!" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const totalEarned = earnings.reduce((sum, e) => sum + Number(e.amount), 0);
  const unpaidEarnings = earnings.filter(e => !e.is_paid).reduce((sum, e) => sum + Number(e.amount), 0);
  const referredStores = new Set(earnings.map(e => e.stores?.name)).size;

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
      
      <main className="flex-1 bg-secondary/30 py-8 md:py-12">
        <div className="container max-w-4xl">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Affiliate Program</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Earn 30% commission on every store subscription you refer. Help local businesses join isoko.io and get rewarded!
            </p>
          </motion.div>

          {affiliate ? (
            // Affiliate Dashboard
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Promo Code Card */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Your Promo Code</p>
                      <p className="text-3xl font-bold font-mono">{affiliate.promo_code}</p>
                    </div>
                    <Button onClick={copyPromoCode} className="gap-2">
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Share this code with store owners. When they register using your code, you earn 30% of their subscription fees!
                  </p>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Earned</p>
                        <p className="text-xl font-bold">{totalEarned.toLocaleString()} RWF</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                        <TrendingUp className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Unpaid Earnings</p>
                        <p className="text-xl font-bold">{unpaidEarnings.toLocaleString()} RWF</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Stores Referred</p>
                        <p className="text-xl font-bold">{referredStores}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Earnings History */}
              <Card>
                <CardHeader>
                  <CardTitle>Earnings History</CardTitle>
                  <CardDescription>Track your commissions from referred stores</CardDescription>
                </CardHeader>
                <CardContent>
                  {earnings.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No earnings yet. Start sharing your promo code to earn commissions!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {earnings.map((earning) => (
                        <div
                          key={earning.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                        >
                          <div>
                            <p className="font-medium">{earning.stores?.name || "Store"}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(earning.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{Number(earning.amount).toLocaleString()} RWF</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              earning.is_paid 
                                ? "bg-green-100 text-green-700" 
                                : "bg-amber-100 text-amber-700"
                            }`}>
                              {earning.is_paid ? "Paid" : "Pending"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            // Signup Form
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Benefits */}
              <div className="grid gap-4 sm:grid-cols-3 mb-8">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-3">
                      <Gift className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">30% Commission</h3>
                    <p className="text-sm text-muted-foreground">
                      Earn on every subscription payment from your referrals
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-3">
                      <Copy className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">Unique Promo Code</h3>
                    <p className="text-sm text-muted-foreground">
                      Get your own code to share with potential store owners
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-3">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">Recurring Income</h3>
                    <p className="text-sm text-muted-foreground">
                      Earn monthly as long as your referrals stay active
                    </p>
                  </CardContent>
                </Card>
              </div>

              {!userId && (
                <Alert className="mb-6 border-amber/30 bg-amber/10">
                  <AlertDescription>
                    You'll need to{" "}
                    <a href="/auth" className="text-primary font-medium hover:underline">
                      sign in or create an account
                    </a>{" "}
                    to become an affiliate.
                  </AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Join the Program</CardTitle>
                  <CardDescription>
                    Fill in your details to become an affiliate partner
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="Your full name"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <PhoneInput
                      id="phone"
                      value={formData.phone}
                      onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                    />
                  </div>
                  <Button 
                    onClick={handleSubmit} 
                    className="w-full gap-2" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Joining..." : "Join Affiliate Program"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AffiliatePage;
