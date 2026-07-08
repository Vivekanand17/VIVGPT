import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { useTypewriter } from "../hooks/useTypewriter";
import FeatureCards from "./FeatureCards";
import AIVisual from "./AIVisual";

const typewriterText =
  "Ask anything.\nUpload documents.\nResearch smarter.";

export default function Hero({ onTryVivgpt }) {
  const { displayText } = useTypewriter(typewriterText, 50);

  const scrollToChat = () => {
    onTryVivgpt();
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="gradient-mesh absolute inset-0" />

      {/* Gradient orbs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-violet-600/10 blur-[100px]"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-sky-400/8 blur-[90px]"
      />
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[80px]"
      />

      {/* Light beams */}
      <motion.div
        animate={{ opacity: [0, 0.15, 0], rotate: [15, 20, 15] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-violet-400/40 to-transparent"
      />
      <motion.div
        animate={{ opacity: [0, 0.1, 0], rotate: [-10, -15, -10] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute right-1/3 top-0 h-full w-px bg-gradient-to-b from-transparent via-sky-400/30 to-transparent"
      />

      {/* Floating background particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-white/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 40, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Glass panel accents */}
      <div className="absolute left-8 top-32 hidden h-32 w-48 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm lg:block" />
      <div className="absolute right-12 bottom-40 hidden h-24 w-36 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm lg:block" />

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pb-20 pt-28 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left column */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md"
            >
              <Zap className="h-3.5 w-3.5 text-violet-400" />
              <span className="text-xs font-medium tracking-wide text-neutral-300">
                Powered by Gemini + LangGraph
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl"
            >
              <span className="bg-gradient-to-b from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
                Your Intelligent AI Agent
              </span>
              <br />
              <span className="bg-gradient-to-b from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
                That Thinks, Searches & Creates
              </span>
            </motion.h1>

            {/* Typewriter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mb-6 min-h-[4.5rem] text-lg font-medium text-violet-300 md:text-xl"
            >
              <span className="whitespace-pre-line">{displayText}</span>
              <span className="ml-0.5 inline-block h-5 w-[2px] translate-y-0.5 bg-violet-400 cursor-blink" />
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mb-10 max-w-[650px] text-lg leading-relaxed text-neutral-400"
            >
              VIVGPT is an agentic AI assistant that combines LLMs, RAG, web
              search, and memory into one intelligent workspace.
            </motion.p>

            {/* CTA */}
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToChat}
              className="group mb-12 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-base font-semibold text-black shadow-[0_0_40px_rgba(255,255,255,0.15)] transition hover:shadow-[0_0_60px_rgba(255,255,255,0.25)]"
            >
              Try VIVGPT
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </motion.button>

            {/* Feature cards — mobile/tablet below CTA */}
            <div className="w-full lg:hidden">
              <FeatureCards />
            </div>
          </div>

          {/* Right column — AI Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="hidden lg:flex lg:items-center lg:justify-center"
          >
            <AIVisual />
          </motion.div>
        </div>

        {/* Feature cards — desktop */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-16 hidden lg:block"
        >
          <FeatureCards />
        </motion.div>

        {/* AI Visual — mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 lg:hidden"
        >
          <AIVisual />
        </motion.div>
      </div>
    </section>
  );
}
