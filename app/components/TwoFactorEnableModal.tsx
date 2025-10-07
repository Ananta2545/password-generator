"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Loader2, ShieldCheck } from "lucide-react";
import Image from "next/image";

interface TwoFactorEnableModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: string;
  secret: string;
  onVerify: (token: string) => Promise<void>;
  loading?: boolean;
}

export default function TwoFactorEnableModal({
  isOpen,
  onClose,
  qrCode,
  secret,
  onVerify,
  loading = false,
}: TwoFactorEnableModalProps) {
  const [copied, setCopied] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationToken.trim()) {
      setError("Please enter the verification code");
      return;
    }

    setLocalLoading(true);
    setError("");

    try {
      await onVerify(verificationToken);
      // Success handling is done in parent component
    } catch (err: unknown) {
        let message = "Verification failed. Please try again.";
        if(err instanceof Error){
            message = err.message;
        }
      setError(message || "Verification failed. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = loading || localLoading;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Enable 2FA
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Scan the QR code with your authenticator app
                </p>
              </div>
            </div>

            {/* QR Code */}
            <div className="mb-6">
              <div className="bg-white p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex justify-center">
                {qrCode && (
                  <Image
                    src={qrCode}
                    alt="2FA QR Code"
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                )}
              </div>
            </div>

            {/* Manual Entry */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Or enter this code manually:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm font-mono break-all">
                  {secret}
                </code>
                <button
                  onClick={handleCopy}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Copy secret"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter 6-digit code from your app
                </label>
                <input
                  type="text"
                  value={verificationToken}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setVerificationToken(value);
                    setError("");
                  }}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-center text-2xl tracking-widest font-mono"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400"
                >
                  {error}
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || verificationToken.length !== 6}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Enable"
                  )}
                </button>
              </div>
            </form>

            {/* Info */}
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              Use apps like Google Authenticator, Authy, or 1Password
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
