import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, CheckCircle, Clock, Copy, Edit, BarChart3, ScanLine } from "lucide-react";
import { formatDate, isPast } from "@/lib/utils";
import { toast } from "sonner";

export default function HostDashboardPage() {
  const { hostId } = useParams<{ hostId: string }>();
  const { user } = useAuth();
  const [host, setHost] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<Record<string, { going: number; waitlist: number; checkedIn: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [hostId]);

  async function load() {
    setLoading(true);
    const { data: h } = await supabase.from("hosts").select("*").eq("id", hostId!).single();
    setHost(h);
    const { data: ev } = await supabase.from("events").select("*").eq("host_id", hostId!).order("start_time", { ascending: false });
    setEvents(ev || []);

    // Get stats
    const ids = (ev || []).map(e => e.id);
    if (ids.length > 0) {
      const { data: rsvps } = await supabase.from("rsvps").select("event_id, status").in("event_id", ids);
      const { data: checkins } = await supabase.from("check_ins").select("event_id").in("event_id", ids).eq("undone", false);
      const s: typeof stats = {};
      ids.forEach(id => { s[id] = { going: 0, waitlist: 0, checkedIn: 0 }; });
      rsvps?.forEach(r => { if (r.status === "confirmed") s[r.event_id].going++; else if (r.status === "waitlisted") s[r.event_id].waitlist++; });
      checkins?.forEach(c => { s[c.event_id].checkedIn++; });
      setStats(s);
    }
    setLoading(false);
  }

  async function duplicateEvent(e: any) {
    const { id, created_at, updated_at, ...rest } = e;
    const { data, error } = await supabase.from("events").insert({ ...rest, title: `${rest.title} (Copy)`, status: "draft" as const }).select().single();
    if (error) { toast.error(error.message); return; }
    toast.success("Event duplicated as draft");
    load();
  }

  if (loading) return <div className="container mx-auto px-4 py-8"><Skeleton className="h-40 w-full" /></div>;
  if (!host) return <div className="container mx-auto px-4 py-20 text-center"><h2 className="text-2xl font-bold">Host not found</h2></div>;

  const upcoming = events.filter(e => !isPast(e.end_time));
  const past = events.filter(e => isPast(e.end_time));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {host.logo_url && <img src={host.logo_url} alt="" className="h-10 w-10 rounded-full object-cover" />}
          <h1 className="text-2xl font-bold">{host.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild><Link to={`/dashboard/${hostId}/events/new`}><Plus className="mr-2 h-4 w-4" />Create Event</Link></Button>
          <Button variant="outline" asChild><Link to={`/dashboard/${hostId}/team`}>Team</Link></Button>
          <Button variant="outline" asChild><Link to={`/dashboard/${hostId}/reports`}>Reports</Link></Button>
        </div>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList><TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger><TabsTrigger value="past">Past ({past.length})</TabsTrigger></TabsList>
        {["upcoming", "past"].map(tab => (
          <TabsContent key={tab} value={tab}>
            <div className="space-y-3">
              {(tab === "upcoming" ? upcoming : past).map(e => (
                <Card key={e.id}>
                  <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link to={`/events/${e.id}`} className="font-semibold hover:text-primary transition-colors">{e.title}</Link>
                        <Badge variant={e.status === "published" ? "default" : "secondary"}>{e.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{formatDate(e.start_time, e.timezone)}</p>
                      <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{stats[e.id]?.going || 0} going</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{stats[e.id]?.waitlist || 0} waitlist</span>
                        <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" />{stats[e.id]?.checkedIn || 0} checked in</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild title="Edit"><Link to={`/dashboard/${hostId}/events/${e.id}/edit`}><Edit className="h-4 w-4" /></Link></Button>
                      <Button variant="ghost" size="icon" title="Duplicate" onClick={() => duplicateEvent(e)}><Copy className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" asChild title="Attendees"><Link to={`/dashboard/${hostId}/events/${e.id}/attendees`}><BarChart3 className="h-4 w-4" /></Link></Button>
                      <Button variant="ghost" size="icon" asChild title="Check-in"><Link to={`/dashboard/${hostId}/events/${e.id}/checkin`}><ScanLine className="h-4 w-4" /></Link></Button>
                      <Button variant="ghost" size="icon" asChild title="Gallery"><Link to={`/dashboard/${hostId}/events/${e.id}/gallery`}><span className="text-xs">📷</span></Link></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(tab === "upcoming" ? upcoming : past).length === 0 && <p className="py-8 text-center text-muted-foreground">No {tab} events</p>}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
