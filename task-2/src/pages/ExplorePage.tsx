import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { formatDate, formatTime, isPast } from "@/lib/utils";
import { HelmetProvider, Helmet } from "react-helmet-async";

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  timezone: string;
  venue_address: string | null;
  online_link: string | null;
  capacity: number | null;
  cover_image_url: string | null;
  status: string;
  host_id: string;
  hosts?: { id: string; name: string; logo_url: string | null } | null;
  rsvp_count?: number;
}

export default function ExplorePage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [location, setLocation] = useState(searchParams.get("loc") || "");
  const [includePast, setIncludePast] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [includePast]);

  async function fetchEvents() {
    setLoading(true);
    let q = supabase
      .from("events")
      .select("*, hosts(id, name, logo_url)")
      .eq("status", "published")
      .eq("visibility", "public")
      .order("start_time", { ascending: true });

    if (!includePast) {
      q = q.gte("start_time", new Date().toISOString());
    }

    const { data } = await q;
    if (data) {
      // Get RSVP counts
      const eventIds = data.map((e) => e.id);
      const { data: rsvpData } = await supabase
        .from("rsvps")
        .select("event_id")
        .in("event_id", eventIds)
        .eq("status", "confirmed");

      const counts: Record<string, number> = {};
      rsvpData?.forEach((r) => { counts[r.event_id] = (counts[r.event_id] || 0) + 1; });

      setEvents(data.map((e) => ({ ...e, rsvp_count: counts[e.id] || 0 })) as EventRow[]);
    }
    setLoading(false);
  }

  const filtered = events.filter((e) => {
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !(e.description || "").toLowerCase().includes(search.toLowerCase())) return false;
    if (location && !(e.venue_address || "").toLowerCase().includes(location.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>EventPass – Discover Events</title>
        <meta name="description" content="Browse and RSVP to free community events near you" />
      </Helmet>

      <div className="mb-8">
        <h1 className="text-3xl font-bold md:text-4xl">Discover Events</h1>
        <p className="mt-2 text-muted-foreground">Browse free community events and meetups</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search events…" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex-1">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Filter by location…" className="pl-10" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="past" checked={includePast} onCheckedChange={setIncludePast} />
          <Label htmlFor="past">Include Past</Label>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="p-0"><Skeleton className="h-48 w-full rounded-t-lg" /><div className="p-4 space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></div></CardContent></Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No events found</h3>
          <p className="mt-1 text-muted-foreground">Try adjusting your search or check back later</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <Link key={event.id} to={`/events/${event.id}`} className="group">
              <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative h-48 overflow-hidden bg-muted">
                  {event.cover_image_url ? (
                    <img src={event.cover_image_url} alt={event.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-primary/10"><Calendar className="h-12 w-12 text-primary/40" /></div>
                  )}
                  {isPast(event.end_time) && (
                    <Badge variant="secondary" className="absolute right-2 top-2">Ended</Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{event.title}</h3>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(event.start_time, event.timezone)} · {formatTime(event.start_time, event.timezone)}</div>
                    {event.venue_address && <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /><span className="line-clamp-1">{event.venue_address}</span></div>}
                    <div className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{event.rsvp_count || 0} going{event.capacity ? ` · ${event.capacity - (event.rsvp_count || 0)} spots left` : ""}</div>
                  </div>
                  {event.hosts && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>by {event.hosts.name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
