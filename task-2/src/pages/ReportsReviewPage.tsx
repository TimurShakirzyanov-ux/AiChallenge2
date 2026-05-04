import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function ReportsReviewPage() {
  const { hostId } = useParams();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("reports").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setReports(data || []);
      setLoading(false);
    });
  }, []);

  async function updateStatus(id: string, status: "hidden" | "dismissed") {
    const { error } = await supabase.from("reports").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Report ${status}`);
    setReports(r => r.map(x => x.id === id ? { ...x, status } : x));
  }

  if (loading) return <div className="container mx-auto px-4 py-8"><Skeleton className="h-40 w-full" /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      {reports.length === 0 ? <p className="py-8 text-center text-muted-foreground">No reports</p> : (
        <div className="space-y-3">
          {reports.map(r => (
            <Card key={r.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{r.target_type}</Badge>
                    <Badge variant={r.status === "pending" ? "secondary" : r.status === "hidden" ? "destructive" : "default"}>{r.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm">{r.reason}</p>
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => updateStatus(r.id, "hidden")}>Hide</Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "dismissed")}>Dismiss</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
