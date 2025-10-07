"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";
import { useVault } from "@/app/contexts/VaultContext";
import { Loader2, Lock, KeyRound, Shield, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useUser();
  const { itemCount } = useVault();
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(to bottom right, var(--bg-gradient-start), var(--bg-gradient-end))`,
        }}
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--btn-bg)" }} />
      </div>
    );
  }
  if (!user) return null;
  return (
    <div
      className="min-h-screen pt-20 px-6 pb-12"
      style={{
        background: `linear-gradient(to bottom right, var(--bg-gradient-start), var(--bg-gradient-end))`,
      }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--text)" }}>
            Welcome back, {user.firstName}! 👋
          </h1>
          <p className="text-lg mb-8" style={{ color: "var(--text-muted)" }}>
            Your secure password management dashboard
          </p>
        </motion.div>
        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div
            className="backdrop-blur-lg rounded-2xl shadow-lg p-6 border"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "var(--card-border)",
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: "var(--btn-bg)", color: "#fff" }}
              >
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <p style={{ color: "var(--text-muted)" }} className="text-sm">
                  Stored Items
                </p>
                <p style={{ color: "var(--text)" }} className="text-2xl font-bold">
                  {itemCount}
                </p>
              </div>
            </div>
          </div>
          <div
            className="backdrop-blur-lg rounded-2xl shadow-lg p-6 border"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "var(--card-border)",
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: "#22c55e", color: "#fff" }}
              >
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p style={{ color: "var(--text-muted)" }} className="text-sm">
                  2FA Status
                </p>
                <p style={{ color: "var(--text)" }} className="text-2xl font-bold">
                  {user.twoFactorEnabled ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>
          </div>
          <div
            className="backdrop-blur-lg rounded-2xl shadow-lg p-6 border"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "var(--card-border)",
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: "#f59e0b", color: "#fff" }}
              >
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <p style={{ color: "var(--text-muted)" }} className="text-sm">
                  Encryption
                </p>
                <p style={{ color: "var(--text)" }} className="text-2xl font-bold">
                  AES-256
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text)" }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {}
            <Link href="/generator">
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="backdrop-blur-lg rounded-2xl shadow-lg p-8 border cursor-pointer group"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderColor: "var(--card-border)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: "var(--btn-bg)", color: "#fff" }}
                  >
                    <KeyRound className="w-8 h-8" />
                  </div>
                  <ArrowRight
                    className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--btn-bg)" }}
                  />
                </div>
                <h3 style={{ color: "var(--text)" }} className="text-xl font-bold mb-2">
                  Generate Password
                </h3>
                <p style={{ color: "var(--text-muted)" }} className="text-sm">
                  Create strong, secure passwords with customizable options
                </p>
              </motion.div>
            </Link>
            {}
            <Link href="/vault">
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="backdrop-blur-lg rounded-2xl shadow-lg p-8 border cursor-pointer group"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderColor: "var(--card-border)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: "#22c55e", color: "#fff" }}
                  >
                    <Lock className="w-8 h-8" />
                  </div>
                  <ArrowRight
                    className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "#22c55e" }}
                  />
                </div>
                <h3 style={{ color: "var(--text)" }} className="text-xl font-bold mb-2">
                  Secure Vault
                </h3>
                <p style={{ color: "var(--text-muted)" }} className="text-sm">
                  Manage your encrypted passwords and credentials
                </p>
              </motion.div>
            </Link>
            {}
            <Link href="/profile">
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="backdrop-blur-lg rounded-2xl shadow-lg p-8 border cursor-pointer group"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderColor: "var(--card-border)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: "#8b5cf6", color: "#fff" }}
                  >
                    <Shield className="w-8 h-8" />
                  </div>
                  <ArrowRight
                    className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "#8b5cf6" }}
                  />
                </div>
                <h3 style={{ color: "var(--text)" }} className="text-xl font-bold mb-2">
                  Profile & Security
                </h3>
                <p style={{ color: "var(--text-muted)" }} className="text-sm">
                  Manage your account and enable two-factor authentication
                </p>
              </motion.div>
            </Link>
            {}
            <motion.div
              className="backdrop-blur-lg rounded-2xl shadow-lg p-8 border"
              style={{
                backgroundColor: "rgba(59, 130, 246, 0.05)",
                borderColor: "var(--btn-bg)",
              }}
            >
              <h3 style={{ color: "var(--text)" }} className="text-xl font-bold mb-3">
                🔒 Privacy First
              </h3>
              <ul style={{ color: "var(--text-muted)" }} className="space-y-2 text-sm">
                <li>✓ Client-side AES-256 encryption</li>
                <li>✓ Server never sees plaintext passwords</li>
                <li>✓ Auto-clear clipboard after 15 seconds</li>
                <li>✓ Optional two-factor authentication</li>
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}