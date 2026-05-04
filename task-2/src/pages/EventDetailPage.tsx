import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Calendar, MapPin, Users, Globe, Flag, Star, Image as ImageIcon } from "lucide-react";
import { formatDateTime, isPast } from "@/lib/utils";
import { Helmet } from "react-helmet-async";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [host, setHost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rsvp, setRsvp] = useState<any>(null);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [myFeedback, setMyFeedback] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<any[]>([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: string; id: string } | null>(null);
  const [reportReason, setReportReason] = useState("");

  useEffect(() => { if (id) load(); }, [id, user]);

  async function load() {
    setLoading(true);
    const { data: ev } = await supabase.from("events").select("*").eq("id", id!).single();
    if (!ev) { setLoading(false); return; }
    setEvent(ev);

    const { data: h } = await supabase.from("hosts").select("*").eq("id", ev.host_id).single();
    setHost(h);

    const { data: rsvps } = await supabase.from("rsvps").select("id").eq("event_id", id!).eq("status", "confirmed");
    setRsvpCount(rsvps?.length || 0);

    if (user) {
      const { data: myRsvp } = await supabase.from("rsvps").select("*").eq("event_id", id!).eq("user_id", user.id).maybeSingle();
      setRsvp(myRsvp);
      const { data: fb } = await supabase.from("feedback").select("*").eq("event_id", id!).eq("user_id", user.id).maybeSingle();
      setMyFeedback(fb);
    }

    const { data: allFb } = await supabase.from("feedback").select("*, profiles(display_name)").eq("event_id", id!).order("created_at", { ascending: false });
    setFeedback(allFb || []);

    const { data: ph } = await supabase.from("gallery_photos").select("*").eq("event_id", id!).eq("status", "approved");
    setPhotos(ph || []);

    setLoading(false);
  }

  async function handleRSVP() {
    if (!user) { navigate(`/auth?redirect=/events/${id}`); return; }
    setRsvpLoading(true);
    const { data, error } = await supabase.rpc("handle_rsvp", { p_event_id: id!, p_user_id: user.id });
    setRsvpLoading(false);
    if (error) { toast.error(error.message); return; }
    setRsvp(data);
    if (data.status === "confirmed") {
      toast.success("You're in! Check your tickets.");
      setRsvpCount((c) => c + 1);
    } else {
      toast.info("You've been added to the waitlist.");
    }
  }

  async function handleCancel() {
    if (!rsvp) return;
    setRsvpLoading(true);
    const { error } = await supabase.rpc("cancel_rsvp", { p_rsvp_id: rsvp.id });
    setRsvpLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("RSVP cancelled");
    setRsvp({ ...rsvp, status: "cancelled" });
    setRsvpCount((c) => Math.max(0, c - 1));
  }

  async function handleFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("feedback").insert({ event_id: id!, user_id: user.id, rating, comment: comment || null });
    if (error) { toast.error(error.message); return; }
    toast.success("Thanks for your feedback!");
    load();
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !reportTarget) return;
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      target_type: reportTarget.type as "event" | "photo",
      target_id: reportTarget.id,
      reason: reportReason,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Report submitted");
    setReportOpen(false);
    setReportReason("");
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const path = `${user.id}/gallery/${id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("uploads").upload(path, file);
    if (upErr) { toast.error(upErr.message); return; }
    const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(path);
    const { error } = await supabase.from("gallery_photos").insert({ event_id: id!, uploaded_by: user.id, image_url: urlData.publicUrl });
    if (error) { toast.error(error.message); return; }
    toast.success("Photo uploaded! It will appear after review.");
  }

  if (loading) return <div className="container mx-auto px-4 py-8"><Skeleton className="h-64 w-full rounded-lg" /><div className="mt-4 space-y-2"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-4 w-1/3" /></div></div>;
  if (!event) return <div className="container mx-auto px-4 py-20 text-center"><h2 className="text-2xl font-bold">Event not found</h2></div>;

  const past = isPast(event.end_time);
  const atCapacity = event.capacity && rsvpCount >= event.capacity;
  const hasRsvp = rsvp && rsvp.status !== "cancelled";
  const canFeedback = past && user && rsvp?.status === "confirmed" && !myFeedback;

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{event.title} – EventPass</title>
        <meta name="description" content={event.description?.substring(0, 160) || event.title} />
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={event.description?.substring(0, 160) || ""} />
        {event.cover_image_url && <meta property="og:image" content={event.cover_image_url} />}
      </Helmet>

      {/* Cover */}
      {event.cover_image_url && (
        <div className="mb-6 h-64 md:h-80 overflow-hidden rounded-xl">
          <img src={event.cover_image_url} alt={event.title} className="h-full w-full object-cover" />
        </div>
      )}

      {past && (
        <div className="mb-4 rounded-lg border border-muted bg-muted/50 px-4 py-3 text-muted-foreground">
          This event has ended
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{event.title}</h1>
            {host && (
              <Link to={`/hosts/${host.id}`} className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                by {host.name}
              </Link>
            )}
          </div>
          <p className="text-foreground/80 whitespace-pre-wrap">{event.description}</p>

          {/* Feedback section */}
          {past && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Feedback</h2>
              {canFeedback && (
                <Card>
                  <CardContent className="p-4">
                    <form onSubmit={handleFeedback} className="space-y-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} type="button" onClick={() => setRating(s)}>
                            <Star className={`h-6 w-6 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                          </button>
                        ))}
                      </div>
                      <Textarea placeholder="Optional comment…" value={comment} onChange={(e) => setComment(e.target.value)} />
                      <Button type="submit" size="sm">Submit Feedback</Button>
                    </form>
                  </CardContent>
                </Card>
              )}
              {feedback.length === 0 ? <p className="text-muted-foreground text-sm">No feedback yet</p> : (
                <div className="space-y-3">
                  {feedback.map((f) => (
                    <Card key={f.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`h-4 w-4 ${s <= f.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />)}</div>
                          <span className="text-sm text-muted-foreground">{f.profiles?.display_name}</span>
                        </div>
                        {f.comment && <p className="mt-2 text-sm">{f.comment}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Gallery section */}
          {past && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Gallery</h2>
                {user && rsvp?.status === "confirmed" && (
                  <Button variant="outline" size="sm" asChild>
                    <label className="cursor-pointer"><ImageIcon className="mr-2 h-4 w-4" />Upload Photo<input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} /></label>
                  </Button>
                )}
              </div>
              {photos.length === 0 ? <p className="text-muted-foreground text-sm">No photos yet</p> : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {photos.map((p) => (
                    <div key={p.id} className="group relative overflow-hidden rounded-lg">
                      <img src={p.image_url} alt="" className="aspect-square w-full object-cover" />
                      {user && (
                        <Button variant="ghost" size="icon" className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80"
                          onClick={() => { setReportTarget({ type: "photo", id: p.id }); setReportOpen(true); }}>
                          <Flag className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" />{formatDateTime(event.start_time, event.timezone)}</div>
              <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" />Ends: {formatDateTime(event.end_time, event.timezone)}</div>
              {event.venue_address && <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" />{event.venue_address}</div>}
              {event.online_link && <div className="flex items-center gap-2 text-sm"><Globe className="h-4 w-4 text-muted-foreground" /><a href={event.online_link} target="_blank" rel="noreferrer" className="text-primary hover:underline">Join Online</a></div>}
              <div className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-muted-foreground" />{rsvpCount} going{event.capacity ? ` / ${event.capacity}` : ""}</div>

              {!past && (
                hasRsvp ? (
                  <div className="space-y-2">
                    <Badge variant={rsvp.status === "confirmed" ? "default" : "secondary"} className="w-full justify-center py-1">{rsvp.status === "confirmed" ? "✓ You're going!" : `Waitlisted (#${rsvp.waitlist_position})`}</Badge>
                    <Button variant="outline" size="sm" className="w-full" onClick={handleCancel} disabled={rsvpLoading}>Cancel RSVP</Button>
                  </div>
                ) : (
                  <Button className="w-full" onClick={handleRSVP} disabled={rsvpLoading}>
                    {rsvpLoading ? "Processing…" : atCapacity ? "Join Waitlist" : "RSVP – Free"}
                  </Button>
                )
              )}

              {user && !past && (
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => { setReportTarget({ type: "event", id: event.id }); setReportOpen(true); }}>
                  <Flag className="mr-2 h-3.5 w-3.5" /> Report Event
                </Button>
              )}
            </CardContent>
          </Card>

          {host && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Hosted by</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0">
                <Link to={`/hosts/${host.id}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                  {host.logo_url && <img src={host.logo_url} alt="" className="h-10 w-10 rounded-full object-cover" />}
                  <div><p className="font-medium">{host.name}</p><p className="text-xs text-muted-foreground">{host.contact_email}</p></div>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Report dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Report</DialogTitle></DialogHeader>
          <form onSubmit={handleReport} className="space-y-4">
            <Textarea placeholder="Why are you reporting this?" value={reportReason} onChange={(e) => setReportReason(e.target.value)} required />
            <Button type="submit">Submit Report</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
