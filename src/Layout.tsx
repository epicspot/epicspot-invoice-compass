
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { useEffect } from "react";

const Layout = () => {
  const location = useLocation();
  
  // Log pour debug à chaque changement de route
  useEffect(() => {
    console.log("Current route:", location.pathname);
  }, [location]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
