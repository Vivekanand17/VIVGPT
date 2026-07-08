import { useCallback } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ChatSection from "./components/ChatSection";

export default function App() {
  const scrollToChat = useCallback(() => {
    const chatSection = document.getElementById("vivgpt-chat");
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black font-sans text-white antialiased">
      <Navbar onTryVivgpt={scrollToChat} />
      <Hero onTryVivgpt={scrollToChat} />
      <ChatSection />
    </div>
  );
}
