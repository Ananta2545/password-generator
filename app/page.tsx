"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Shield, Lock, Zap } from "lucide-react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center transition-all duration-500"
      style={{
        background: `linear-gradient(to bottom right, var(--bg-gradient-start), var(--bg-gradient-end))`,
        color: "var(--text)",
      }}
    >
      

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center px-6 mt-28 md:mt-32"
      >
        <motion.h2 
          style={{ color: "var(--text)" }} 
          className="text-5xl md:text-6xl font-extrabold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Secure. Smart. Effortless.
        </motion.h2>
        <motion.p 
          style={{ color: "var(--text-muted)" }} 
          className="text-lg md:text-xl max-w-xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Generate, store, and protect all your passwords — with 2FA security and your personal vault.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:shadow-2xl"
            style={{ backgroundColor: "var(--btn-bg)", color: "#fff" }}
          >
            Get Started →
          </Link>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {[
            {
              icon: <Shield className="w-8 h-8" />,
              title: "Bank-Level Security",
              description: "256-bit AES encryption",
            },
            {
              icon: <Lock className="w-8 h-8" />,
              title: "2FA Protected",
              description: "Two-factor authentication",
            },
            {
              icon: <Zap className="w-8 h-8" />,
              title: "Lightning Fast",
              description: "Generate passwords instantly",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 cursor-pointer"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderColor: "var(--card-border)",
              }}
            >
              <motion.div
                className="mb-4 inline-flex p-3 rounded-xl"
                style={{ backgroundColor: "var(--btn-bg)", color: "#fff" }}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {feature.icon}
              </motion.div>
              <h3 style={{ color: "var(--text)" }} className="text-xl font-bold mb-2">
                {feature.title}
              </h3>
              <p style={{ color: "var(--text-muted)" }} className="text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-24 text-sm text-center px-4"
        style={{ color: "var(--text-muted)" }}
      >
        Built with ❤️ using Next.js, TypeScript, and TailwindCSS
      </motion.footer>
    </div>
  );
}