import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PermissionProtectedRoute from "@/components/PermissionProtectedRoute";
import Header, { Footer } from "@/components/Header";
import HomePage from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import SearchPage from "@/pages/search";
import DataEntryPage from "@/pages/data-entry";
import ReportsPage from "@/pages/reports";
import SettingsPage from "@/pages/settings";
import ImportPage from "@/pages/import";
import LoginPage from "@/pages/login";
import NotFound from "@/pages/not-found";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/">
        <ProtectedLayout>
          <HomePage />
        </ProtectedLayout>
      </Route>
      <Route path="/blocks/dashboard">
        <ProtectedLayout>
          <PermissionProtectedRoute permission="dashboard">
            <Dashboard />
          </PermissionProtectedRoute>
        </ProtectedLayout>
      </Route>
      <Route path="/blocks/search">
        <ProtectedLayout>
          <PermissionProtectedRoute permission="search">
            <SearchPage />
          </PermissionProtectedRoute>
        </ProtectedLayout>
      </Route>
      <Route path="/blocks/data-entry">
        <ProtectedLayout>
          <PermissionProtectedRoute permission="data_entry">
            <DataEntryPage />
          </PermissionProtectedRoute>
        </ProtectedLayout>
      </Route>
      <Route path="/blocks/reports">
        <ProtectedLayout>
          <PermissionProtectedRoute permission="reports">
            <ReportsPage />
          </PermissionProtectedRoute>
        </ProtectedLayout>
      </Route>
      <Route path="/blocks/settings">
        <ProtectedLayout>
          <PermissionProtectedRoute anyOfPermissions={["settings_users", "settings_stations", "settings_ports"]}>
            <SettingsPage />
          </PermissionProtectedRoute>
        </ProtectedLayout>
      </Route>
      <Route path="/blocks/import">
        <ProtectedLayout>
          <PermissionProtectedRoute permission="import">
            <ImportPage />
          </PermissionProtectedRoute>
        </ProtectedLayout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
