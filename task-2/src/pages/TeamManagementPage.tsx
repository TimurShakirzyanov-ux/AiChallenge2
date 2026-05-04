import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Copy, UserPlus } from "lucide-react";

export default function TeamManagementPage() {
  const { hostId } = useParams();
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [hostId]);

  async function load() {
    const { data } = await supabase.from("host_members").select("*, profiles(display_name)").eq("host_id", hostId!);
    setMembers(data || []);
    setLoading(false);
  }

  async function generateInvite(role: "host" | "checker") {
    if (!user) return;
    const { data, error } = await supabase.from("host_invites").insert({ host_id: hostId!, role, created_by: user.id }).select().single();
    if (error) { toast.error(error.message); return; }
    const url = `${window.location.origin}/join/${data.token}`;
    await navigator.clipboard.writeText(url);
    toast.success("Invite link copied to clipboard!");
  }

  if (loading) return <div className="container mx-auto px-4 py-8"><Skeleton className="h-40 w-full" /></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {members.map(m => (
            <div key={m.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium">{m.profiles?.display_name || "Unknown"}</p>
              </div>
              <Badge variant={m.role === "host" ? "default" : "secondary"}>{m.role}</Badge>
            </div>
          ))}

          <div className="flex gap-2 pt-4">
            <Button onClick={() => generateInvite("host")} variant="outline">
              <UserPlus className="mr-2 h-4 w-4" /> Invite Host
            </Button>
            <Button onClick={() => generateInvite("checker")} variant="outline">
              <UserPlus className="mr-2 h-4 w-4" /> Invite Checker
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
