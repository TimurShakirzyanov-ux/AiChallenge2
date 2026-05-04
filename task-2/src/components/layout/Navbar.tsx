import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Ticket, LayoutDashboard, LogOut, UserPlus, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [hostMemberships, setHostMemberships] = useState<{ host_id: string; role: string }[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user) { setHostMemberships([]); return; }
    supabase
      .from("host_members")
      .select("host_id, role")
      .eq("user_id", user.id)
      .then(({ data }) => setHostMemberships(data || []));
  }, [user]);

  const initials = user?.email?.substring(0, 2).toUpperCase() || "?";
  const isHost = hostMemberships.some((m) => m.role === "host");

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <Calendar className="h-6 w-6" />
          EventPass
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" asChild><Link to="/">Explore</Link></Button>
          {user && (
            <>
              <Button variant="ghost" asChild><Link to="/tickets">My Tickets</Link></Button>
              <Button variant="ghost" asChild><Link to="/my-events">My Events</Link></Button>
            </>
          )}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {!user ? (
            <>
              <Button variant="ghost" asChild><Link to="/auth">Sign In</Link></Button>
              <Button asChild><Link to="/auth?tab=signup">Sign Up</Link></Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm text-muted-foreground">{user.email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/tickets")}>
                  <Ticket className="mr-2 h-4 w-4" /> My Tickets
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/my-events")}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> My Events
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isHost ? (
                  hostMemberships.filter(m => m.role === 'host').map(m => (
                    <DropdownMenuItem key={m.host_id} onClick={() => navigate(`/dashboard/${m.host_id}`)}>
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem onClick={() => navigate("/become-host")}>
                    <UserPlus className="mr-2 h-4 w-4" /> Become a Host
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-background px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-2">
            <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileOpen(false)}><Link to="/">Explore</Link></Button>
            {user ? (
              <>
                <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileOpen(false)}><Link to="/tickets">My Tickets</Link></Button>
                <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileOpen(false)}><Link to="/my-events">My Events</Link></Button>
                {isHost ? (
                  hostMemberships.filter(m => m.role === 'host').map(m => (
                    <Button key={m.host_id} variant="ghost" className="justify-start" asChild onClick={() => setMobileOpen(false)}>
                      <Link to={`/dashboard/${m.host_id}`}>Dashboard</Link>
                    </Button>
                  ))
                ) : (
                  <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileOpen(false)}><Link to="/become-host">Become a Host</Link></Button>
                )}
                <Button variant="ghost" className="justify-start text-destructive" onClick={() => { signOut(); setMobileOpen(false); }}>Sign Out</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileOpen(false)}><Link to="/auth">Sign In</Link></Button>
                <Button className="justify-start" asChild onClick={() => setMobileOpen(false)}><Link to="/auth?tab=signup">Sign Up</Link></Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
