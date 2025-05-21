
import { Outlet, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { useEffect } from "react";

const Layout = () => {
  const location = useLocation();
  
  // Log pour debug à chaque changement de route
  useEffect(() => {
    console.log("Current route:", location.pathname);
  }, [location]);

  // Si l'URL contient un hashtag dans le pathname, rediriger vers la bonne route
  // Mais on vérifie que ce n'est pas le hashtag de base du hashRouter
  if (location.hash && !location.hash.startsWith('#/')) {
    const targetRoute = location.hash.substring(1); // Remove the # character
    console.log("Redirecting from hash to path:", targetRoute);
    return <Navigate to={targetRoute} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
