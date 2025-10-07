"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useUser();

  // ✅ Redirect to signin if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  // ✅ Show loading spinner while checking auth
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

  // ✅ Don't render if no user
  if (!user) return null;

  return (
    <div
      className="min-h-screen pt-20 px-6"
      style={{
        background: `linear-gradient(to bottom right, var(--bg-gradient-start), var(--bg-gradient-end))`,
      }}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--text)" }}>
          Welcome back, {user.firstName}! 👋
        </h1>
        <p className="text-lg mb-8" style={{ color: "var(--text-muted)" }}>
          Your secure password vault
        </p>

        {/* TODO: Add password generator and vault features here */}
        <div
          className="p-8 rounded-2xl backdrop-blur-lg border"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderColor: "var(--card-border)",
          }}
        >
          <p style={{ color: "var(--text)" }}>Dashboard content coming soon...</p>
        </div>
      </div>
    </div>
  );
}