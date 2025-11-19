import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header, { Footer } from "@/components/Header";
import Dashboard from "@/pages/dashboard";
import SearchPage from "@/pages/search";
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
          <Dashboard />
        </ProtectedLayout>
      </Route>
      <Route path="/search">
        <ProtectedLayout>
          <SearchPage />
        </ProtectedLayout>
      </Route>
      <Route path="/reports">
        <ProtectedLayout>
          <div className="container mx-auto max-w-7xl px-6 py-8" dir="rtl">
            <h2 className="text-2xl font-semibold">التقارير</h2>
            <p className="mt-4 text-muted-foreground">قريباً...</p>
          </div>
        </ProtectedLayout>
      </Route>
      <Route path="/users">
        <ProtectedLayout>
          <div className="container mx-auto max-w-7xl px-6 py-8" dir="rtl">
            <h2 className="text-2xl font-semibold">المستخدمين</h2>
            <p className="mt-4 text-muted-foreground">قريباً...</p>
          </div>
        </ProtectedLayout>
      </Route>
      <Route path="/operations">
        <ProtectedLayout>
          <div className="container mx-auto max-w-7xl px-6 py-8" dir="rtl">
            <h2 className="text-2xl font-semibold">عمليات البلاغات</h2>
            <p className="mt-4 text-muted-foreground">قريباً...</p>
          </div>
        </ProtectedLayout>
      </Route>
      <Route path="/backup">
        <ProtectedLayout>
          <div className="container mx-auto max-w-7xl px-6 py-8" dir="rtl">
            <h2 className="text-2xl font-semibold">النسخة الاحتياطية</h2>
            <p className="mt-4 text-muted-foreground">قريباً...</p>
          </div>
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
