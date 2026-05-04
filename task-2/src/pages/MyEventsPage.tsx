import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Search, Edit, Copy, BarChart3, ScanLine } from "lucide-react";
import { formatDate, isPast } from "@/lib/utils";

export default function MyEventsPage() {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("host_members")
      .select("host_id, role, hosts(id, name)")
      .eq("user_id", user.id)
      .then(async ({ data: members }) => {
        setMemberships(members || []);
        const hostIds = (members || []).map((m) => m.host_id);
        if (hostIds.length === 0) { setLoading(false); return; }
        const { data: ev } = await supabase
          .from("events")
          .select("*")
          .in("host_id", hostIds)
          .order("start_time", { ascending: false });
        setEvents(ev || []);
        setLoading(false);
      });
  }, [user]);

  const filtered = events.filter(e => !search || e.title.toLowerCase().includes(search.toLowerCase()));
  const roleForEvent = (hostId: string) => memberships.find(m => m.host_id === hostId)?.role;

  if (loading) return <div className="container mx-auto px-4 py-8"><Skeleton className="h-40 w-full" /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Events</h1>

      {memberships.length === 0 ? (
        <div className="py-20 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">You're not part of any host team yet</h3>
          <p className="mt-1 text-muted-foreground">Become a host or join a team via invite</p>
          <Button className="mt-4" asChild><Link to="/become-host">Become a Host</Link></Button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search events…" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="space-y-3">
            {filtered.map((e) => {
              const role = roleForEvent(e.host_id);
              return (
                <Card key={e.id}>
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link to={`/events/${e.id}`} className="font-semibold hover:text-primary transition-colors truncate">{e.title}</Link>
                        <Badge variant={e.status === "published" ? "default" : "secondary"}>{e.status}</Badge>
                        {isPast(e.end_time) && <Badge variant="outline">Past</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{formatDate(e.start_time, e.timezone)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {role === "host" && (
                        <>
                          <Button variant="ghost" size="icon" asChild title="Edit"><Link to={`/dashboard/${e.host_id}/events/${e.id}/edit`}><Edit className="h-4 w-4" /></Link></Button>
                          <Button variant="ghost" size="icon" asChild title="Attendees"><Link to={`/dashboard/${e.host_id}/events/${e.id}/attendees`}><BarChart3 className="h-4 w-4" /></Link></Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" asChild title="Check-in"><Link to={`/dashboard/${e.host_id}/events/${e.id}/checkin`}><ScanLine className="h-4 w-4" /></Link></Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
