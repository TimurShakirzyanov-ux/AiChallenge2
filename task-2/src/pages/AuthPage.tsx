import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") === "signup" ? "signup" : "signin";
  const redirect = searchParams.get("redirect") || "/";
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate(redirect, { replace: true });
  }, [user, navigate, redirect]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.get("email") as string,
      password: form.get("password") as string,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Signed in!");
    navigate(redirect, { replace: true });
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signUp({
      email: form.get("email") as string,
      password: form.get("password") as string,
      options: { data: { display_name: form.get("name") as string } },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Account created! You're now signed in.");
    navigate(redirect, { replace: true });
  };

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <Tabs defaultValue={defaultTab}>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to EventPass</CardTitle>
            <CardDescription>Sign in or create an account to RSVP to events</CardDescription>
            <TabsList className="mt-4 grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div><Label htmlFor="si-email">Email</Label><Input id="si-email" name="email" type="email" required /></div>
                <div><Label htmlFor="si-pass">Password</Label><Input id="si-pass" name="password" type="password" required /></div>
                <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign In"}</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div><Label htmlFor="su-name">Display Name</Label><Input id="su-name" name="name" required /></div>
                <div><Label htmlFor="su-email">Email</Label><Input id="su-email" name="email" type="email" required /></div>
                <div><Label htmlFor="su-pass">Password</Label><Input id="su-pass" name="password" type="password" required minLength={6} /></div>
                <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating account…" : "Sign Up"}</Button>
              </form>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
