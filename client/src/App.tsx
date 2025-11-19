import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Dashboard from "@/pages/dashboard";
import SearchPage from "@/pages/search";
import LoginPage from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/" component={Dashboard} />
      <Route path="/search" component={SearchPage} />
      <Route path="/reports">
        <div className="container mx-auto max-w-7xl px-6 py-8" dir="rtl">
          <h2 className="text-2xl font-semibold">التقارير</h2>
          <p className="mt-4 text-muted-foreground">قريباً...</p>
        </div>
      </Route>
      <Route path="/users">
        <div className="container mx-auto max-w-7xl px-6 py-8" dir="rtl">
          <h2 className="text-2xl font-semibold">المستخدمين</h2>
          <p className="mt-4 text-muted-foreground">قريباً...</p>
        </div>
      </Route>
      <Route path="/operations">
        <div className="container mx-auto max-w-7xl px-6 py-8" dir="rtl">
          <h2 className="text-2xl font-semibold">عمليات البلاغات</h2>
          <p className="mt-4 text-muted-foreground">قريباً...</p>
        </div>
      </Route>
      <Route path="/backup">
        <div className="container mx-auto max-w-7xl px-6 py-8" dir="rtl">
          <h2 className="text-2xl font-semibold">النسخة الاحتياطية</h2>
          <p className="mt-4 text-muted-foreground">قريباً...</p>
        </div>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex min-h-screen flex-col">
          <Header username="مستخدم 1" />
          <main className="flex-1">
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
