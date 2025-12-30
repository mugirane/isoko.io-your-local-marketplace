import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, User, Mail, Phone, ArrowRight, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuickFollowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  storeName: string;
  onFollowSuccess: () => void;
}

const QuickFollowDialog = ({
  open,
  onOpenChange,
  storeId,
  storeName,
  onFollowSuccess,
}: QuickFollowDialogProps) => {
  const [step, setStep] = useState<"choice" | "form">("choice");
  const [useEmail, setUseEmail] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      // Generate a random password for the user
      const password = Math.random().toString(36).slice(-12) + "Aa1!";
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: useEmail ? email : `${phone.replace(/\D/g, "")}@phone.isoko.io`,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: name,
            phone: useEmail ? undefined : phone,
          },
        },
      });

      if (signUpError) {
        // If user already exists, try to sign in
        if (signUpError.message.includes("already registered")) {
          toast({
            title: "Already have an account?",
            description: "Please sign in to follow stores.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        throw signUpError;
      }

      if (authData.user) {
        // Update phone in profile if provided
        if (!useEmail && phone) {
          await supabase
            .from("profiles")
            .update({ phone })
            .eq("user_id", authData.user.id);
        }

        // Follow the store
        const { error: followError } = await supabase
          .from("store_followers")
          .insert({
            store_id: storeId,
            user_id: authData.user.id,
          });

        if (followError && !followError.message.includes("duplicate")) {
          throw followError;
        }

        toast({
          title: "Following!",
          description: `You are now following ${storeName}`,
        });
        onFollowSuccess();
        onOpenChange(false);
        resetForm();
      }
    } catch (error: any) {
      console.error("Quick signup error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep("choice");
    setName("");
    setEmail("");
    setPhone("");
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) resetForm();
      onOpenChange(value);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Follow {storeName}
          </DialogTitle>
          <DialogDescription>
            Quick sign up to follow stores and get updates
          </DialogDescription>
        </DialogHeader>

        {step === "choice" ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 py-4"
          >
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-14"
              onClick={() => {
                setUseEmail(true);
                setStep("form");
              }}
            >
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <p className="font-medium">Continue with Email</p>
                <p className="text-xs text-muted-foreground">Quick and easy</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-14"
              onClick={() => {
                setUseEmail(false);
                setStep("form");
              }}
            >
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <p className="font-medium">Continue with Phone</p>
                <p className="text-xs text-muted-foreground">No email needed</p>
              </div>
            </Button>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleQuickSignup}
            className="space-y-4 py-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Enter your name"
                  className="pl-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {useEmail ? (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+250 7XX XXX XXX"
                    className="pl-10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep("choice")}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing up...
                  </>
                ) : (
                  <>
                    Follow Store
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              By continuing, you agree to our Terms of Service
            </p>
          </motion.form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickFollowDialog;
