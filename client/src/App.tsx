import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import { useConfig } from "@/hooks/useConfig";
import { Loader2 } from "lucide-react";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white text-black p-6">
          <h1 className="text-2xl font-bold mb-4">¡Ups! Algo salió mal.</h1>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 max-w-lg overflow-auto">
            <pre className="text-red-600 text-sm font-mono whitespace-pre-wrap">
              {this.state.error?.message}
            </pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-black text-white rounded-full font-bold hover:bg-gray-800"
          >
            Intentar Recargar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

import TrackOrder from "@/pages/track-order";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route path="/rastreo" component={TrackOrder} />
      <Route component={NotFound} />
    </Switch>
  );
}

function MaintenancePage({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-6 text-center">
      <div className="max-w-md space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
          CERRADO TEMPORALMENTE
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 font-medium leading-relaxed">
          {message || "Nos vemos pronto. Gracias por preferirnos."}
        </p>
        <div className="h-1 w-24 bg-orange-500 mx-auto rounded-full mt-8" />
      </div>
    </div>
  );
}

function AppContent() {
  const { config, isLoading, error } = useConfig();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="animate-spin text-orange-500 h-10 w-10" />
      </div>
    );
  }



  // Check maintenance mode
  // If siteActive is specifically false, AND we are NOT on /admin route AND NOT on /rastreo
  if (config?.settings?.siteActive === false && !location.startsWith("/admin") && !location.startsWith("/rastreo")) {
    return <MaintenancePage message={config.settings.siteClosedMessage} />;
  }

  return <Router />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
