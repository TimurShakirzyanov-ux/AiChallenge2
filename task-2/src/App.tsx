import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { HelmetProvider } from "react-helmet-async";
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import ExplorePage from "./pages/ExplorePage";
import EventDetailPage from "./pages/EventDetailPage";
import HostPublicPage from "./pages/HostPublicPage";
import AuthPage from "./pages/AuthPage";
import MyTicketsPage from "./pages/MyTicketsPage";
import MyEventsPage from "./pages/MyEventsPage";
import BecomeHostPage from "./pages/BecomeHostPage";
import HostDashboardPage from "./pages/HostDashboardPage";
import EventEditorPage from "./pages/EventEditorPage";
import EventAttendeesPage from "./pages/EventAttendeesPage";
import CheckInPage from "./pages/CheckInPage";
import GalleryManagementPage from "./pages/GalleryManagementPage";
import ReportsReviewPage from "./pages/ReportsReviewPage";
import TeamManagementPage from "./pages/TeamManagementPage";
import JoinInvitePage from "./pages/JoinInvitePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<ExplorePage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/hosts/:id" element={<HostPublicPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/join/:token" element={<ProtectedRoute><JoinInvitePage /></ProtectedRoute>} />
                <Route path="/tickets" element={<ProtectedRoute><MyTicketsPage /></ProtectedRoute>} />
                <Route path="/my-events" element={<ProtectedRoute><MyEventsPage /></ProtectedRoute>} />
                <Route path="/become-host" element={<ProtectedRoute><BecomeHostPage /></ProtectedRoute>} />
                <Route path="/dashboard/:hostId" element={<ProtectedRoute><HostDashboardPage /></ProtectedRoute>} />
                <Route path="/dashboard/:hostId/events/new" element={<ProtectedRoute><EventEditorPage /></ProtectedRoute>} />
                <Route path="/dashboard/:hostId/events/:eventId/edit" element={<ProtectedRoute><EventEditorPage /></ProtectedRoute>} />
                <Route path="/dashboard/:hostId/events/:eventId/attendees" element={<ProtectedRoute><EventAttendeesPage /></ProtectedRoute>} />
                <Route path="/dashboard/:hostId/events/:eventId/checkin" element={<ProtectedRoute><CheckInPage /></ProtectedRoute>} />
                <Route path="/dashboard/:hostId/events/:eventId/gallery" element={<ProtectedRoute><GalleryManagementPage /></ProtectedRoute>} />
                <Route path="/dashboard/:hostId/reports" element={<ProtectedRoute><ReportsReviewPage /></ProtectedRoute>} />
                <Route path="/dashboard/:hostId/team" element={<ProtectedRoute><TeamManagementPage /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
