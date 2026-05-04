import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Mail } from "lucide-react";
import { formatDate, formatTime, isPast } from "@/lib/utils";
import { Helmet } from "react-helmet-async";

export default function HostPublicPage() {
  const { id } = useParams<{ id: string }>();
  const [host, setHost] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from("hosts").select("*").eq("id", id).single(),
      supabase.from("events").select("*").eq("host_id", id).eq("status", "published").order("start_time", { ascending: false }),
    ]).then(([{ data: h }, { data: ev }]) => {
      setHost(h);
      setEvents(ev || []);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="container mx-auto px-4 py-8"><Skeleton className="h-32 w-full" /></div>;
  if (!host) return <div className="container mx-auto px-4 py-20 text-center"><h2 className="text-2xl font-bold">Host not found</h2></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{host.name} – EventPass</title>
        <meta name="description" content={host.bio?.substring(0, 160) || host.name} />
        <meta property="og:title" content={host.name} />
        <meta property="og:description" content={host.bio || ""} />
        {host.logo_url && <meta property="og:image" content={host.logo_url} />}
      </Helmet>

      <div className="flex items-center gap-4 mb-6">
        {host.logo_url && <img src={host.logo_url} alt="" className="h-16 w-16 rounded-full object-cover" />}
        <div>
          <h1 className="text-2xl font-bold">{host.name}</h1>
          {host.contact_email && <p className="text-sm text-muted-foreground flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{host.contact_email}</p>}
        </div>
      </div>
      {host.bio && <p className="mb-8 text-foreground/80">{host.bio}</p>}

      <h2 className="text-xl font-semibold mb-4">Events</h2>
      {events.length === 0 ? <p className="text-muted-foreground">No events yet</p> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <Link key={e.id} to={`/events/${e.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                {e.cover_image_url && <img src={e.cover_image_url} alt="" className="h-40 w-full object-cover" />}
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold line-clamp-1">{e.title}</h3>
                    {isPast(e.end_time) && <Badge variant="secondary">Ended</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(e.start_time, e.timezone)}</p>
                  {e.venue_address && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /><span className="line-clamp-1">{e.venue_address}</span></p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
