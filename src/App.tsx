import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useRef, useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PWAUpdatePrompt } from "@/components/PWAUpdatePrompt";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import '@/i18n/config';
import { lazy, Suspense } from "react";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { LoadingState } from "./components/LoadingState";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Invoices = lazy(() => import("./pages/Invoices"));
const Quotes = lazy(() => import("./pages/Quotes"));
const Clients = lazy(() => import("./pages/Clients"));
const Products = lazy(() => import("./pages/Products"));
const Users = lazy(() => import("./pages/Users"));
const Settings = lazy(() => import("./pages/Settings"));
const CashRegisters = lazy(() => import("./pages/CashRegisters"));
const Leads = lazy(() => import("./pages/Leads"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Reminders = lazy(() => import("./pages/Reminders"));
const Reports = lazy(() => import("./pages/Reports"));
const POS = lazy(() => import("./pages/POS"));
const Suppliers = lazy(() => import("./pages/Suppliers"));
const PurchaseOrders = lazy(() => import("./pages/PurchaseOrders"));
const BusinessAnalytics = lazy(() => import("./pages/BusinessAnalytics"));
const Vendors = lazy(() => import("./pages/Vendors"));
const Collections = lazy(() => import("./pages/Collections"));
const CollectionsDashboard = lazy(() => import("./pages/CollectionsDashboard"));
const SecurityAudit = lazy(() => import("./pages/SecurityAudit"));
const AdvancedAnalytics = lazy(() => import("./pages/AdvancedAnalytics"));
const Integrations = lazy(() => import("./pages/Integrations"));
const AdvancedFeatures = lazy(() => import("./pages/AdvancedFeatures"));
const Subscriptions = lazy(() => import("./pages/Subscriptions"));
const TaxDeclarations = lazy(() => import("./pages/TaxDeclarations"));
const TaxAnalyticsDashboard = lazy(() => import("./pages/TaxAnalyticsDashboard"));
const Markets = lazy(() => import("./pages/Markets"));
const MarketDetails = lazy(() => import("./pages/MarketDetails"));
const DocumentTemplates = lazy(() => import("./pages/DocumentTemplates"));
const Monitoring = lazy(() => import("./pages/Monitoring"));
import { AIAssistant } from "./components/AIAssistant";
import Sidebar from "./components/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const App = () => {
  const queryClientRef = useRef<QueryClient>();
  
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  // Load saved theme on mount
  useEffect(() => {
    const savedPrimary = localStorage.getItem('theme-primary');
    const savedAccent = localStorage.getItem('theme-accent');
    
    if (savedPrimary) {
      document.documentElement.style.setProperty('--primary', savedPrimary);
      document.documentElement.style.setProperty('--sidebar-primary', savedPrimary);
    }
    if (savedAccent) {
      document.documentElement.style.setProperty('--accent', savedAccent);
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClientRef.current}>
        <NotificationProvider>
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
                        <Suspense fallback={<LoadingState message="Chargement de la page..." />}>
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
                            <Route path="/subscriptions" element={<Subscriptions />} />
                            <Route path="/collections" element={<Collections />} />
                            <Route path="/collections/dashboard" element={<CollectionsDashboard />} />
                            <Route path="/security" element={<SecurityAudit />} />
                            <Route path="/advanced-analytics" element={<AdvancedAnalytics />} />
                            <Route path="/integrations" element={<Integrations />} />
                            <Route path="/advanced-features" element={<AdvancedFeatures />} />
                            <Route path="/reminders" element={<Reminders />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/users" element={<Users />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/tax-declarations" element={<TaxDeclarations />} />
                            <Route path="/tax-analytics" element={<TaxAnalyticsDashboard />} />
                            <Route path="/markets" element={<Markets />} />
                            <Route path="/markets/:id" element={<MarketDetails />} />
                            <Route path="/document-templates" element={<DocumentTemplates />} />
                            <Route path="/monitoring" element={<Monitoring />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Suspense>
                        <AIAssistant />
                      </div>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
            </Routes>
            <Toaster />
            <Sonner />
            <PWAInstallPrompt />
            <PWAUpdatePrompt />
            <OfflineIndicator />
          </TooltipProvider>
        </BrowserRouter>
        </AuthProvider>
        </NotificationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
