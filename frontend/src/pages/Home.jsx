import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

export default function Home() {
  const navigate = useNavigate();

  const openChat = useCallback(() => {
    navigate("/chat");
  }, [navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black font-sans text-white antialiased">
      <Navbar onTryVivgpt={openChat} />
      <Hero onTryVivgpt={openChat} />
    </div>
  );
}

