import { motion } from "framer-motion";

const particles = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 4,
  duration: Math.random() * 8 + 6,
}));

const neuralNodes = [
  { x: 50, y: 30 },
  { x: 25, y: 55 },
  { x: 75, y: 55 },
  { x: 35, y: 78 },
  { x: 65, y: 78 },
  { x: 50, y: 62 },
];

const neuralEdges = [
  [0, 1], [0, 2], [0, 5], [1, 3], [2, 4], [1, 5], [2, 5], [3, 5], [4, 5],
];

export default function AIVisual() {
  return (
    <div className="relative mx-auto flex h-[340px] w-full max-w-[420px] items-center justify-center lg:h-[480px] lg:max-w-none">
      {/* Ambient glow */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-64 w-64 rounded-full bg-violet-600/20 blur-[80px] lg:h-80 lg:w-80"
      />
      <motion.div
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute h-48 w-48 rounded-full bg-sky-400/15 blur-[60px]"
        style={{ transform: "translate(40px, -30px)" }}
      />

      {/* Outer ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute h-[280px] w-[280px] rounded-full border border-violet-500/20 lg:h-[360px] lg:w-[360px]"
        style={{
          background:
            "conic-gradient(from 0deg, transparent, rgba(124,58,237,0.15), transparent, rgba(56,189,248,0.1), transparent)",
        }}
      />

      {/* Middle ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute h-[220px] w-[220px] rounded-full border border-white/5 lg:h-[280px] lg:w-[280px]"
      >
        <div className="absolute inset-0 rounded-full border border-dashed border-sky-400/20" />
      </motion.div>

      {/* Inner ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute h-[160px] w-[160px] rounded-full border border-emerald-400/20 lg:h-[200px] lg:w-[200px]"
      />

      {/* Neural network SVG overlay */}
      <svg
        className="absolute h-[280px] w-[280px] lg:h-[360px] lg:w-[360px]"
        viewBox="0 0 100 100"
        fill="none"
      >
        {neuralEdges.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={neuralNodes[a].x}
            y1={neuralNodes[a].y}
            x2={neuralNodes[b].x}
            y2={neuralNodes[b].y}
            stroke="rgba(124,58,237,0.3)"
            strokeWidth="0.15"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0.2, 0.6, 0.2] }}
            transition={{
              pathLength: { duration: 2, delay: i * 0.1 },
              opacity: { duration: 3, repeat: Infinity, delay: i * 0.2 },
            }}
          />
        ))}
        {neuralNodes.map((node, i) => (
          <motion.circle
            key={i}
            cx={node.x}
            cy={node.y}
            r="1.2"
            fill="rgba(56,189,248,0.8)"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </svg>

      {/* Core sphere */}
      <motion.div
        animate={{ y: [-6, 6, -6] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10"
      >
        <div className="relative h-28 w-28 rounded-full lg:h-36 lg:w-36">
          {/* Sphere layers */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.25), rgba(124,58,237,0.6) 40%, rgba(30,20,60,0.9) 70%, rgba(5,5,5,1) 100%)",
              boxShadow:
                "0 0 60px rgba(124,58,237,0.5), 0 0 120px rgba(56,189,248,0.2), inset 0 0 30px rgba(255,255,255,0.1)",
            }}
          />
          <div
            className="absolute inset-2 rounded-full opacity-60"
            style={{
              background:
                "radial-gradient(circle at 60% 70%, rgba(34,197,94,0.3), transparent 60%)",
            }}
          />
          {/* Highlight */}
          <div className="absolute left-[22%] top-[18%] h-6 w-6 rounded-full bg-white/30 blur-md lg:h-8 lg:w-8" />
        </div>
      </motion.div>

      {/* Floating data particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: 0.4,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Glass panels */}
      <motion.div
        animate={{ y: [-4, 4, -4], rotate: [0, 2, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-2 top-8 h-16 w-24 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md lg:-right-6 lg:top-12 lg:h-20 lg:w-28"
      />
      <motion.div
        animate={{ y: [4, -4, 4], rotate: [0, -2, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -left-2 bottom-16 h-14 w-20 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md lg:-left-6 lg:bottom-20 lg:h-16 lg:w-24"
      />
    </div>
  );
}
