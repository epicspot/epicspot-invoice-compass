
import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useDatabase } from "@/lib/contexts/DatabaseContext";

const Index = () => {
  const navigate = useNavigate();
  const { isInitialized } = useDatabase();

  useEffect(() => {
    if (isInitialized) {
      console.log("Database initialized, redirecting to dashboard");
      navigate('/dashboard');
    } else {
      console.log("Database not initialized yet");
    }
  }, [navigate, isInitialized]);

  return (
    <div className="flex items-center justify-center h-full flex-col space-y-4">
      <div className="text-2xl font-bold">EPICSPOT Consulting</div>
      <div className="text-gray-500">Initialisation de l'application...</div>
    </div>
  );
};

export default Index;
