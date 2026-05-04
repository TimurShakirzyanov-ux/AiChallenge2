import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function BecomeHostPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const bio = form.get("bio") as string;
    const email = form.get("email") as string;

    // Upload logo if provided
    let logoUrl: string | null = null;
    const logoFile = (e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement)?.files?.[0];
    if (logoFile) {
      const path = `${user.id}/logos/${Date.now()}-${logoFile.name}`;
      const { error: upErr } = await supabase.storage.from("uploads").upload(path, logoFile);
      if (upErr) { toast.error(upErr.message); setLoading(false); return; }
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      logoUrl = data.publicUrl;
    }

    const { data: host, error } = await supabase.from("hosts").insert({
      name,
      bio: bio || null,
      contact_email: email || null,
      logo_url: logoUrl,
      created_by: user.id,
    }).select().single();

    if (error) { toast.error(error.message); setLoading(false); return; }

    // Add self as host member
    await supabase.from("host_members").insert({
      host_id: host.id,
      user_id: user.id,
      role: "host",
    });

    toast.success("You're now a host!");
    navigate(`/dashboard/${host.id}`);
  }

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Become a Host</CardTitle>
          <CardDescription>Create your host profile to start organizing events</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label htmlFor="name">Organization Name *</Label><Input id="name" name="name" required /></div>
            <div><Label htmlFor="logo">Logo</Label><Input id="logo" type="file" accept="image/*" /></div>
            <div><Label htmlFor="bio">Short Bio</Label><Textarea id="bio" name="bio" rows={3} /></div>
            <div><Label htmlFor="email">Contact Email</Label><Input id="email" name="email" type="email" /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating…" : "Create Host Profile"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
