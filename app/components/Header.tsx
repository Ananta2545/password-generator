"use client";

import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Menu, X, User, LogOut, Settings, Shield } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext"; // ✅ Import useUser

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useUser(); // ✅ Use context instead of state
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      logout(); // ✅ Use context logout
      setShowDropdown(false);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!mounted) return null;

  const isAuthPage = pathname?.startsWith("/auth");

  return (
    <nav className="sticky top-0 w-full flex justify-between items-center px-6 md:px-12 py-4 backdrop-blur-lg bg-white/60 dark:bg-black/30 border-b border-gray-200 dark:border-gray-800 z-50">
      <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
        <Link href={user ? "/dashboard" : "/"} style={{ color: "var(--text)" }} className="text-2xl font-bold">
          PassGen<span style={{ color: "var(--btn-bg)" }}>Pro</span>
        </Link>
      </motion.div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-4">
        {user ? (
          // User Profile Dropdown
          <div className="relative" ref={dropdownRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300"
              style={{
                backgroundColor: "var(--btn-bg)",
                color: "#fff",
              }}
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <span className="font-medium">{user.firstName}</span> {/* ✅ Updates automatically */}
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border overflow-hidden"
                  style={{
                    backgroundColor: "var(--bg-gradient-start)",
                    borderColor: "var(--card-border)",
                  }}
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b" style={{ borderColor: "var(--card-border)" }}>
                    <p className="font-semibold" style={{ color: "var(--text)" }}>
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {user.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      href="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-white/5"
                      style={{ color: "var(--text)" }}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      href="/dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-white/5"
                      style={{ color: "var(--text)" }}
                    >
                      <Shield className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-white/5"
                      style={{ color: "var(--text)" }}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>

                    <div className="border-t my-2" style={{ borderColor: "var(--card-border)" }} />

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 w-full text-left transition-colors hover:bg-red-500/10 text-red-500"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          // Auth Buttons (Original)
          !isAuthPage && (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/auth/signin"
                  style={{ color: "var(--text)" }}
                  className="hover:opacity-70 transition-opacity"
                >
                  Sign In
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/auth/signup"
                  className="px-5 py-2 rounded-xl font-medium transition-all duration-300 hover:shadow-lg"
                  style={{ backgroundColor: "var(--btn-bg)", color: "#fff" }}
                >
                  Get Started
                </Link>
              </motion.div>
            </>
          )
        )}

        <motion.button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="ml-3 cursor-pointer p-2 rounded-full transition-all duration-300"
          style={{
            backgroundColor: theme === "dark" ? "var(--btn-bg)" : "transparent",
            color: theme === "dark" ? "#fff" : "var(--text)",
          }}
          whileHover={{ rotate: 180, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </motion.button>
      </div>

      {/* Mobile Hamburger */}
      <div className="md:hidden flex items-center">
        <motion.button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-md transition"
          whileTap={{ scale: 0.9 }}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute top-16 right-4 w-48 rounded-xl shadow-lg flex flex-col p-4 gap-3 md:hidden z-50"
          style={{ backgroundColor: "var(--bg-gradient-start)" }}
        >
          {user ? (
            // Mobile User Menu
            <>
              <div className="pb-3 border-b" style={{ borderColor: "var(--card-border)" }}>
                <p className="font-semibold" style={{ color: "var(--text)" }}>
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {user.email}
                </p>
              </div>

              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                style={{ color: "var(--text)" }}
              >
                <User className="w-4 h-4" />
                Profile
              </Link>

              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                style={{ color: "var(--text)" }}
              >
                <Shield className="w-4 h-4" />
                Dashboard
              </Link>

              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                style={{ color: "var(--text)" }}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>

              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 text-red-500 hover:opacity-70 transition-opacity"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            // Mobile Auth Links (Original)
            !isAuthPage && (
              <>
                <Link
                  href="/auth/signin"
                  style={{ color: "var(--text)" }}
                  onClick={() => setMenuOpen(false)}
                  className="hover:opacity-70 transition-opacity"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 rounded-xl font-medium text-center transition-all duration-300 hover:shadow-lg"
                  style={{ backgroundColor: "var(--btn-bg)", color: "#fff" }}
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )
          )}

          <button
            onClick={() => {
              setTheme(theme === "dark" ? "light" : "dark");
              setMenuOpen(false);
            }}
            className="mt-2 p-2 rounded-full transition text-center hover:opacity-80"
          >
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </motion.div>
      )}
    </nav>
  );
}