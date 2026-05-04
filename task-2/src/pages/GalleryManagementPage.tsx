import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export default function GalleryManagementPage() {
  const { eventId } = useParams();
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [eventId]);

  async function load() {
    const { data } = await supabase.from("gallery_photos").select("*").eq("event_id", eventId!).order("created_at", { ascending: false });
    setPhotos(data || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: "approved" | "rejected") {
    const { error } = await supabase.from("gallery_photos").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Photo ${status}`);
    setPhotos(p => p.map(x => x.id === id ? { ...x, status } : x));
  }

  if (loading) return <div className="container mx-auto px-4 py-8"><Skeleton className="h-40 w-full" /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gallery Management</h1>
      {photos.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">No photos uploaded yet</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map(p => (
            <Card key={p.id} className="overflow-hidden">
              <img src={p.image_url} alt="" className="aspect-square w-full object-cover" />
              <CardContent className="p-3 flex items-center justify-between">
                <Badge variant={p.status === "approved" ? "default" : p.status === "rejected" ? "destructive" : "secondary"}>{p.status}</Badge>
                {p.status === "pending" && (
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => updateStatus(p.id, "approved")}><Check className="h-4 w-4 text-green-600" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => updateStatus(p.id, "rejected")}><X className="h-4 w-4 text-red-600" /></Button>
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
