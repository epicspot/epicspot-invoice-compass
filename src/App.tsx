
import { RouterProvider, createHashRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Layout from "./Layout";
import Dashboard from "@/pages/Dashboard";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Clients from "@/pages/Clients";
import Products from "@/pages/Products";
import Invoices from "@/pages/Invoices";
import Quotes from "@/pages/Quotes";
import Users from "@/pages/Users";
import Settings from "@/pages/Settings";
import CashRegisters from "@/pages/CashRegisters";
import { DatabaseProvider } from "./lib/contexts/DatabaseContext";

// Create React Query client
const queryClient = new QueryClient();

const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Index /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "clients", element: <Clients /> },
      { path: "products", element: <Products /> },
      { path: "invoices", element: <Invoices /> },
      { path: "quotes", element: <Quotes /> },
      { path: "users", element: <Users /> },
      { path: "cash-registers", element: <CashRegisters /> },
      { path: "settings", element: <Settings /> }
    ]
  }
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DatabaseProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <RouterProvider router={router} />
          <Toaster />
        </ThemeProvider>
      </DatabaseProvider>
    </QueryClientProvider>
  );
}

export default App;
