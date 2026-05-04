import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

const TIMEZONES = ["UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu", "Europe/London", "Europe/Berlin", "Europe/Paris", "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Asia/Dubai", "Australia/Sydney", "Pacific/Auckland"];

export default function EventEditorPage() {
  const { hostId, eventId } = useParams<{ hostId: string; eventId?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [venueAddress, setVenueAddress] = useState("");
  const [onlineLink, setOnlineLink] = useState("");
  const [capacity, setCapacity] = useState("");
  const [visibility, setVisibility] = useState<"public" | "unlisted">("public");
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    supabase.from("events").select("*").eq("id", eventId).single().then(({ data }) => {
      if (!data) return;
      setEvent(data);
      setTitle(data.title);
      setDescription(data.description || "");
      const st = new Date(data.start_time);
      const et = new Date(data.end_time);
      setStartDate(st.toISOString().split("T")[0]);
      setStartTime(st.toISOString().split("T")[1].substring(0, 5));
      setEndDate(et.toISOString().split("T")[0]);
      setEndTime(et.toISOString().split("T")[1].substring(0, 5));
      setTimezone(data.timezone);
      setVenueAddress(data.venue_address || "");
      setOnlineLink(data.online_link || "");
      setCapacity(data.capacity?.toString() || "");
      setVisibility(data.visibility);
      setIsPaid(data.is_paid);
    });
  }, [eventId]);

  async function handleCoverUpload(file: File) {
    if (!user) return null;
    const path = `${user.id}/covers/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file);
    if (error) { toast.error(error.message); return null; }
    return supabase.storage.from("uploads").getPublicUrl(path).data.publicUrl;
  }

  async function save(status: "draft" | "published") {
    setLoading(true);
    const coverInput = document.getElementById("cover") as HTMLInputElement;
    let coverUrl = event?.cover_image_url || null;
    if (coverInput?.files?.[0]) {
      coverUrl = await handleCoverUpload(coverInput.files[0]);
      if (!coverUrl) { setLoading(false); return; }
    }

    const payload = {
      host_id: hostId!,
      title,
      description: description || null,
      start_time: new Date(`${startDate}T${startTime}:00`).toISOString(),
      end_time: new Date(`${endDate}T${endTime}:00`).toISOString(),
      timezone,
      venue_address: venueAddress || null,
      online_link: onlineLink || null,
      capacity: capacity ? parseInt(capacity) : null,
      cover_image_url: coverUrl,
      visibility: visibility as "public" | "unlisted",
      status: status as "draft" | "published",
      is_paid: false,
    };

    if (eventId) {
      const { error } = await supabase.from("events").update(payload).eq("id", eventId);
      if (error) { toast.error(error.message); setLoading(false); return; }
      toast.success("Event updated");
    } else {
      const { data, error } = await supabase.from("events").insert(payload).select().single();
      if (error) { toast.error(error.message); setLoading(false); return; }
      toast.success("Event created");
      navigate(`/dashboard/${hostId}/events/${data.id}/edit`, { replace: true });
    }
    setLoading(false);
  }

  async function unpublish() {
    if (!eventId) return;
    await supabase.from("events").update({ status: "draft" as const }).eq("id", eventId);
    toast.success("Event unpublished");
    setEvent({ ...event, status: "draft" });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader><CardTitle>{eventId ? "Edit Event" : "Create Event"}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Title *</Label><Input value={title} onChange={e => setTitle(e.target.value)} required /></div>
          <div><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} /></div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label>Start Date *</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required /></div>
            <div><Label>Start Time *</Label><Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>End Date *</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required /></div>
            <div><Label>End Time *</Label><Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required /></div>
          </div>

          <div>
            <Label>Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-60">
                {TIMEZONES.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div><Label>Venue Address</Label><Input value={venueAddress} onChange={e => setVenueAddress(e.target.value)} placeholder="Physical address" /></div>
          <div><Label>Online Link</Label><Input value={onlineLink} onChange={e => setOnlineLink(e.target.value)} placeholder="https://…" /></div>
          <div><Label>Capacity</Label><Input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} min={1} placeholder="Leave empty for unlimited" /></div>
          <div><Label>Cover Image</Label><Input id="cover" type="file" accept="image/*" /></div>

          <div>
            <Label>Visibility</Label>
            <RadioGroup value={visibility} onValueChange={(v) => setVisibility(v as "public" | "unlisted")} className="flex gap-4 mt-1">
              <div className="flex items-center gap-2"><RadioGroupItem value="public" id="vis-pub" /><Label htmlFor="vis-pub">Public</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="unlisted" id="vis-unl" /><Label htmlFor="vis-unl">Unlisted</Label></div>
            </RadioGroup>
          </div>

          <div className="flex items-center gap-3">
            <Label>Free</Label>
            <Switch checked={false} disabled />
            <Tooltip>
              <TooltipTrigger asChild>
                <Label className="text-muted-foreground cursor-help">Paid (coming soon)</Label>
              </TooltipTrigger>
              <TooltipContent>Coming soon — paid events will be available in a future update</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex flex-wrap gap-2 pt-4">
            <Button onClick={() => save("draft")} variant="outline" disabled={loading || !title || !startDate || !startTime || !endDate || !endTime}>Save Draft</Button>
            <Button onClick={() => save("published")} disabled={loading || !title || !startDate || !startTime || !endDate || !endTime}>Publish</Button>
            {event?.status === "published" && <Button variant="ghost" onClick={unpublish}>Unpublish</Button>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
