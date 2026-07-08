import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Agents", href: "#agents" },
  { label: "Research", href: "#research" },
  { label: "Documents", href: "#documents" },
  { label: "Memory", href: "#memory" },
];

export default function Navbar({ onTryVivgpt }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollToChat = () => {
    setMobileOpen(false);
    onTryVivgpt();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-violet-400" />
          <span className="text-2xl font-semibold tracking-tight text-white">
            VIVGPT
          </span>
        </a>

        {/* Center nav — desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-white/70 transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right buttons — desktop */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            className="rounded-full px-6 py-3 text-sm font-medium text-white/70 transition hover:text-white"
          >
            Login
          </button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={scrollToChat}
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition"
          >
            Try VIVGPT
          </motion.button>
        </div>

        {/* Hamburger — mobile */}
        <button
          type="button"
          className="rounded-lg p-2 text-white md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/10 bg-black/90 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <hr className="my-2 border-white/10" />
              <button
                type="button"
                className="rounded-lg px-3 py-3 text-left text-sm text-white/70 transition hover:text-white"
              >
                Login
              </button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={scrollToChat}
                className="mt-1 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black"
              >
                Try VIVGPT
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
