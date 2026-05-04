import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Calendar, MapPin, Download } from "lucide-react";
import { formatDateTime, downloadICS, isPast } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router-dom";

export default function MyTicketsPage() {
  const { user } = useAuth();
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("rsvps")
      .select("*, events(id, title, description, start_time, end_time, timezone, venue_address, online_link, cover_image_url, hosts(name))")
      .eq("user_id", user.id)
      .in("status", ["confirmed", "waitlisted"])
      .then(({ data }) => {
        // Sort: upcoming first, then by date
        const sorted = (data || []).sort((a, b) => {
          const aTime = new Date(a.events?.start_time || 0).getTime();
          const bTime = new Date(b.events?.start_time || 0).getTime();
          return aTime - bTime;
        });
        setRsvps(sorted);
        setLoading(false);
      });
  }, [user]);

  async function handleCancel(rsvpId: string) {
    const { error } = await supabase.rpc("cancel_rsvp", { p_rsvp_id: rsvpId });
    if (error) { toast.error(error.message); return; }
    toast.success("RSVP cancelled");
    setRsvps((r) => r.filter((x) => x.id !== rsvpId));
  }

  if (loading) return <div className="container mx-auto px-4 py-8"><div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-40 w-full" />)}</div></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Tickets</h1>
      {rsvps.length === 0 ? (
        <div className="py-20 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No tickets yet</h3>
          <p className="mt-1 text-muted-foreground">RSVP to events to see your tickets here</p>
          <Button className="mt-4" asChild><Link to="/">Browse Events</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {rsvps.map((r) => {
            const ev = r.events;
            if (!ev) return null;
            const past = isPast(ev.end_time);
            return (
              <Card key={r.id} className={past ? "opacity-60" : ""}>
                <CardContent className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Link to={`/events/${ev.id}`} className="text-lg font-semibold hover:text-primary transition-colors">{ev.title}</Link>
                      <Badge variant={r.status === "confirmed" ? "default" : "secondary"}>{r.status === "confirmed" ? "Confirmed" : `Waitlisted #${r.waitlist_position}`}</Badge>
                      {past && <Badge variant="outline">Ended</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDateTime(ev.start_time, ev.timezone)}</p>
                    {ev.venue_address && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{ev.venue_address}</p>}
                    {r.ticket_code && <p className="font-mono text-sm">Code: <span className="font-bold">{r.ticket_code}</span></p>}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {!past && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => downloadICS(ev)}><Download className="mr-1 h-3.5 w-3.5" />Add to Calendar</Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleCancel(r.id)}>Cancel RSVP</Button>
                        </>
                      )}
                    </div>
                  </div>
                  {r.status === "confirmed" && r.qr_data && (
                    <div className="flex-shrink-0 flex items-center justify-center">
                      <QRCodeSVG value={r.qr_data} size={120} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
