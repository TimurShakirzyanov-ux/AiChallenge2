import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle, XCircle, Undo2 } from "lucide-react";

export default function CheckInPage() {
  const { hostId, eventId } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [code, setCode] = useState("");
  const [totalConfirmed, setTotalConfirmed] = useState(0);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error" | "already">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, [eventId]);

  async function load() {
    const { data: ev } = await supabase.from("events").select("*").eq("id", eventId!).single();
    setEvent(ev);
    const { data: rsvps } = await supabase.from("rsvps").select("id").eq("event_id", eventId!).eq("status", "confirmed");
    setTotalConfirmed(rsvps?.length || 0);
    const { data: cins } = await supabase.from("check_ins").select("id").eq("event_id", eventId!).eq("undone", false);
    setCheckedInCount(cins?.length || 0);
  }

  async function handleCheckIn(e?: React.FormEvent) {
    e?.preventDefault();
    if (!code.trim() || !user) return;

    // Find RSVP by ticket code
    const { data: rsvp } = await supabase.from("rsvps").select("id, user_id, status, ticket_code").eq("event_id", eventId!).eq("ticket_code", code.trim().toUpperCase()).maybeSingle();

    if (!rsvp || rsvp.status !== "confirmed") {
      setStatus("error");
      setStatusMsg("Invalid code");
      setCode("");
      inputRef.current?.focus();
      return;
    }

    // Check if already checked in
    const { data: existing } = await supabase.from("check_ins").select("id").eq("rsvp_id", rsvp.id).eq("undone", false).maybeSingle();
    if (existing) {
      setStatus("already");
      setStatusMsg("Already checked in");
      setCode("");
      inputRef.current?.focus();
      return;
    }

    const { data: cin, error } = await supabase.from("check_ins").insert({
      rsvp_id: rsvp.id,
      event_id: eventId!,
      checked_in_by: user.id,
    }).select().single();

    if (error) { toast.error(error.message); return; }

    setLastCheckIn(cin.id);
    setCheckedInCount(c => c + 1);
    setStatus("success");
    setStatusMsg("Checked in!");
    setCode("");
    inputRef.current?.focus();
    toast.success("Checked in successfully!");
  }

  async function handleUndo() {
    if (!lastCheckIn) return;
    const { error } = await supabase.from("check_ins").update({ undone: true }).eq("id", lastCheckIn);
    if (error) { toast.error(error.message); return; }
    setCheckedInCount(c => Math.max(0, c - 1));
    setLastCheckIn(null);
    toast.success("Check-in undone");
    setStatus("idle");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">{event?.title || "Check-In"}</CardTitle>
          <div className="flex justify-center gap-8 text-center pt-4">
            <div>
              <p className="text-3xl font-bold text-primary">{checkedInCount}</p>
              <p className="text-sm text-muted-foreground">Checked In</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{totalConfirmed}</p>
              <p className="text-sm text-muted-foreground">Confirmed</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCheckIn} className="flex gap-2">
            <Input
              ref={inputRef}
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setStatus("idle"); }}
              placeholder="Enter ticket code"
              className="font-mono text-lg tracking-wider"
              autoFocus
            />
            <Button type="submit">Check In</Button>
          </form>

          {status === "success" && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3 text-green-700">
              <CheckCircle className="h-5 w-5" /> {statusMsg}
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700">
              <XCircle className="h-5 w-5" /> {statusMsg}
            </div>
          )}
          {status === "already" && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700">
              <XCircle className="h-5 w-5" /> {statusMsg}
            </div>
          )}

          {lastCheckIn && (
            <Button variant="outline" className="w-full" onClick={handleUndo}>
              <Undo2 className="mr-2 h-4 w-4" /> Undo Last Check-In
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
