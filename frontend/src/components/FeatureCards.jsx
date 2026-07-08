import { motion } from "framer-motion";
import { Bot, Database, Globe, Brain } from "lucide-react";

const features = [
  {
    id: "agents",
    icon: Bot,
    title: "AI Agents",
    description: "Autonomous reasoning with LangGraph",
    accent: "#7C3AED",
    delay: 0,
  },
  {
    id: "documents",
    icon: Database,
    title: "Knowledge RAG",
    description: "Chat with your documents",
    accent: "#38BDF8",
    delay: 0.1,
  },
  {
    id: "research",
    icon: Globe,
    title: "Web Intelligence",
    description: "Real-time information search",
    accent: "#22C55E",
    delay: 0.2,
  },
  {
    id: "memory",
    icon: Brain,
    title: "Memory",
    description: "Persistent conversations",
    accent: "#7C3AED",
    delay: 0.3,
  },
];

export default function FeatureCards() {
  return (
    <div
      id="features"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <motion.div
            key={feature.title}
            id={feature.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 + feature.delay }}
            whileHover={{ y: -10, scale: 1.05 }}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_20px_60px_-15px_rgba(124,58,237,0.3)]"
          >
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: `radial-gradient(circle at top left, ${feature.accent}15, transparent 70%)`,
              }}
            />
            <div className="relative">
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5"
                style={{ color: feature.accent }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1.5 text-base font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-neutral-400">
                {feature.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
