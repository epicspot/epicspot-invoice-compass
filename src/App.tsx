
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useRef } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import Quotes from "./pages/Quotes";
import Clients from "./pages/Clients";
import Products from "./pages/Products";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import CashRegisters from "./pages/CashRegisters";
import Sidebar from "./components/Sidebar";

const App = () => {
  const queryClientRef = useRef<QueryClient>();
  
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <BrowserRouter>
        <TooltipProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/quotes" element={<Quotes />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/products" element={<Products />} />
                <Route path="/cash-registers" element={<CashRegisters />} />
                <Route path="/users" element={<Users />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
