import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";
import { exportCSV, formatDateTime } from "@/lib/utils";

export default function EventAttendeesPage() {
  const { hostId, eventId } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("events").select("*").eq("id", eventId!).single(),
      supabase.from("rsvps").select("*, profiles(display_name), check_ins(checked_in_at, undone)").eq("event_id", eventId!).order("rsvp_at"),
    ]).then(([{ data: ev }, { data: r }]) => {
      setEvent(ev);
      setRsvps(r || []);
      setLoading(false);
    });
  }, [eventId]);

  function handleExport() {
    if (!event) return;
    const date = new Date().toISOString().split("T")[0];
    const filename = `${event.title.replace(/\s+/g, "-")}-attendees-${date}.csv`;
    const headers = ["name", "email", "rsvp_status", "checkin_time"];
    const rows = rsvps.map(r => {
      const checkin = r.check_ins?.find((c: any) => !c.undone);
      return [
        r.profiles?.display_name || "",
        "", // email not in profiles select, just display name
        r.status,
        checkin ? formatDateTime(checkin.checked_in_at) : "",
      ];
    });
    exportCSV(filename, headers, rows);
  }

  if (loading) return <div className="container mx-auto px-4 py-8"><Skeleton className="h-40 w-full" /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Attendees: {event?.title}</h1>
        <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>RSVP Date</TableHead>
              <TableHead>Check-in</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rsvps.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No RSVPs yet</TableCell></TableRow>
            ) : rsvps.map(r => {
              const checkin = r.check_ins?.find((c: any) => !c.undone);
              return (
                <TableRow key={r.id}>
                  <TableCell>{r.profiles?.display_name || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "confirmed" ? "default" : r.status === "waitlisted" ? "secondary" : "outline"}>{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDateTime(r.rsvp_at)}</TableCell>
                  <TableCell className="text-sm">{checkin ? formatDateTime(checkin.checked_in_at) : "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
