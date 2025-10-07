"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";
import { useGenerator } from "@/app/contexts/GeneratorContext";
import { Copy, Check, RefreshCw, Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { generatePassword, calculatePasswordStrength, type PasswordOptions } from "@/app/lib/passwordGenerator";
export default function GeneratorPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { setGeneratedPassword } = useGenerator();
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const loading = false;
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: false,
  });
  const strength = password ? calculatePasswordStrength(password) : { score: 0, label: "None", color: "#6b7280" };
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (mounted && !userLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, userLoading, router, mounted]);
  const handleGenerate = () => {
    try {
      const newPassword = generatePassword(options);
      setPassword(newPassword);
    } catch (error: unknown) {
      console.error("Generate error:", error instanceof Error ? error.message : "Unknown error");
    }
  };
  useEffect(() => {
    if (mounted && user) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, user]);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(async () => {
        try {
          const current = await navigator.clipboard.readText();
          if (current === password) {
            await navigator.clipboard.writeText("");
            console.log("Clipboard cleared after 15 seconds");
          }
        } catch (err) {
          console.debug("Clipboard auto-clear failed:", err);
        }
      }, 15000);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };
  const handleSaveToVault = () => {
    setGeneratedPassword(password);
    router.push("/vault");
  };
  if (!mounted) return null;
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, var(--bg-gradient-start), var(--bg-gradient-end))` }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--btn-bg)" }} />
      </div>
    );
  }
  if (!user) return null;
  return (
    <div className="min-h-screen flex flex-col pt-20" style={{ background: `linear-gradient(to bottom right, var(--bg-gradient-start), var(--bg-gradient-end))` }}>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-2xl">
          {}
          <Link href="/dashboard">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mb-4 flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: "var(--text)" }}>
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </motion.button>
          </Link>
          <div className="backdrop-blur-lg rounded-2xl shadow-2xl p-8 border" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", borderColor: "var(--card-border)" }}>
            {}
            <h2 style={{ color: "var(--text)" }} className="text-3xl font-bold mb-2">Password Generator</h2>
            <p style={{ color: "var(--text-muted)" }} className="mb-6">Generate strong, secure passwords instantly</p>
            {}
            <div className="mb-6">
              <div className="flex items-center gap-2 p-4 rounded-xl backdrop-blur-sm border" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", borderColor: "var(--card-border)" }}>
                <input type="text" value={password} readOnly className="flex-1 bg-transparent outline-none font-mono text-lg" style={{ color: "var(--text)" }} />
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleCopy} className="p-2 rounded-lg transition-colors" style={{ backgroundColor: copied ? "#22c55e" : "var(--btn-bg)", color: "#fff" }}>
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </motion.button>
              </div>
              {}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span style={{ color: "var(--text-muted)" }} className="text-sm">Password Strength</span>
                  <span style={{ color: strength.color }} className="text-sm font-semibold">{strength.label}</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${strength.score}%` }} transition={{ duration: 0.3 }} className="h-full rounded-full" style={{ backgroundColor: strength.color }} />
                </div>
              </div>
            </div>
            {}
            <div className="space-y-4 mb-6">
              {}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label style={{ color: "var(--text)" }} className="text-sm font-medium">Length: {options.length}</label>
                </div>
                <input type="range" min="4" max="64" value={options.length} onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })} className="w-full h-2 rounded-lg appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, var(--btn-bg) 0%, var(--btn-bg) ${((options.length - 4) / 60) * 100}%, var(--card-border) ${((options.length - 4) / 60) * 100}%, var(--card-border) 100%)` }} />
              </div>
              {}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={options.includeUppercase} onChange={(e) => setOptions({ ...options, includeUppercase: e.target.checked })} className="w-4 h-4 rounded" />
                  <span style={{ color: "var(--text)" }} className="text-sm">Uppercase (A-Z)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={options.includeLowercase} onChange={(e) => setOptions({ ...options, includeLowercase: e.target.checked })} className="w-4 h-4 rounded" />
                  <span style={{ color: "var(--text)" }} className="text-sm">Lowercase (a-z)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={options.includeNumbers} onChange={(e) => setOptions({ ...options, includeNumbers: e.target.checked })} className="w-4 h-4 rounded" />
                  <span style={{ color: "var(--text)" }} className="text-sm">Numbers (0-9)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={options.includeSymbols} onChange={(e) => setOptions({ ...options, includeSymbols: e.target.checked })} className="w-4 h-4 rounded" />
                  <span style={{ color: "var(--text)" }} className="text-sm">Symbols (!@#$)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer col-span-2">
                  <input type="checkbox" checked={options.excludeAmbiguous} onChange={(e) => setOptions({ ...options, excludeAmbiguous: e.target.checked })} className="w-4 h-4 rounded" />
                  <span style={{ color: "var(--text)" }} className="text-sm">Exclude ambiguous (0, O, l, 1, I)</span>
                </label>
              </div>
            </div>
            {}
            <div className="flex gap-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleGenerate} disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium cursor-pointer transition-all duration-300 disabled:opacity-50" style={{ backgroundColor: "var(--btn-bg)", color: "#fff" }}>
                <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                Generate New
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSaveToVault} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all cursor-pointer duration-300" style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e", border: "1px solid #22c55e" }}>
                <Save className="w-5 h-5" />
                Save to Vault
              </motion.button>
            </div>
            {}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6 p-4 rounded-xl backdrop-blur-sm border" style={{ backgroundColor: "rgba(59, 130, 246, 0.05)", borderColor: "var(--btn-bg)" }}>
              <p style={{ color: "var(--text-muted)" }} className="text-xs">
                <strong style={{ color: "var(--text)" }}>Security Info:</strong> Passwords are generated using cryptographically secure randomness.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
