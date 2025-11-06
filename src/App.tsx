import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useRef } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
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
import Leads from "./pages/Leads";
import Inventory from "./pages/Inventory";
import Reminders from "./pages/Reminders";
import Reports from "./pages/Reports";
import POS from "./pages/POS";
import Suppliers from "./pages/Suppliers";
import PurchaseOrders from "./pages/PurchaseOrders";
import BusinessAnalytics from "./pages/BusinessAnalytics";
import Vendors from "./pages/Vendors";
import Collections from "./pages/Collections";
import Sidebar from "./components/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const App = () => {
  const queryClientRef = useRef<QueryClient>();
  
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <AuthProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <Sidebar />
                      <div className="flex-1 overflow-auto">
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/invoices" element={<Invoices />} />
                          <Route path="/quotes" element={<Quotes />} />
                          <Route path="/clients" element={<Clients />} />
                          <Route path="/leads" element={<Leads />} />
                          <Route path="/products" element={<Products />} />
                          <Route path="/inventory" element={<Inventory />} />
                          <Route path="/suppliers" element={<Suppliers />} />
                          <Route path="/purchase-orders" element={<PurchaseOrders />} />
                          <Route path="/analytics" element={<BusinessAnalytics />} />
                          <Route path="/pos" element={<POS />} />
                          <Route path="/cash-registers" element={<CashRegisters />} />
                          <Route path="/vendors" element={<Vendors />} />
                          <Route path="/collections" element={<Collections />} />
                          <Route path="/reminders" element={<Reminders />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="/users" element={<Users />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </div>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
            </Routes>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
