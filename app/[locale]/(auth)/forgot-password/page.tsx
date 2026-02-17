"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@progress/kendo-react-buttons";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL;

const inputClassName =
  "w-full rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-60";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }

    if (!BACKEND_API_URL) {
      setError("Password reset is not configured");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `Request failed (${response.status})`);
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <div className="py-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
            <svg
              className="h-6 w-6 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-emerald-400">
            If an account exists for that email, you will receive reset instructions.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Check your inbox and spam folder.
          </p>
        </div>
        <p className="mt-6 text-center text-sm text-slate-400">
          <Link
            href="/login"
            className="font-medium text-indigo-400 hover:text-indigo-300"
          >
            Back to sign in
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-lg font-medium text-white">
          Reset your password
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Enter your email and we&apos;ll send you reset instructions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClassName}
          />
        </div>

        {error && (
          <div
            className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-400"
            role="alert"
          >
            {error}
          </div>
        )}

        <Button
          type="submit"
          themeColor="primary"
          disabled={isLoading || !email.trim()}
          className="w-full"
        >
          {isLoading ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-400 hover:text-indigo-300"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
