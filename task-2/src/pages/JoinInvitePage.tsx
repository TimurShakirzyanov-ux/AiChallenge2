import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function JoinInvitePage() {
  const { token } = useParams<{ token: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user || !token) return;
    handleJoin();
  }, [user, token]);

  async function handleJoin() {
    const { data: invite } = await supabase.from("host_invites").select("*").eq("token", token!).maybeSingle();
    if (!invite) { setMessage("Invalid or expired invite link"); setLoading(false); return; }
    if (invite.used_at) { setMessage("This invite has already been used"); setLoading(false); return; }

    // Add as member
    const { error } = await supabase.from("host_members").insert({ host_id: invite.host_id, user_id: user!.id, role: invite.role });
    if (error) {
      if (error.code === "23505") { setMessage("You're already a member of this team"); }
      else { setMessage(error.message); }
      setLoading(false);
      return;
    }

    // Mark invite as used
    await supabase.from("host_invites").update({ used_at: new Date().toISOString() }).eq("id", invite.id);

    toast.success(`You've joined as a ${invite.role}!`);
    navigate(`/dashboard/${invite.host_id}`, { replace: true });
  }

  if (!user) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <p className="text-muted-foreground">Please sign in to accept this invite</p>
    </div>
  );

  if (loading) return <div className="container mx-auto px-4 py-8 flex justify-center"><Skeleton className="h-32 w-96" /></div>;

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center">
      <Card className="max-w-md w-full">
        <CardHeader><CardTitle>Join Team</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">{message}</p></CardContent>
      </Card>
    </div>
  );
}
