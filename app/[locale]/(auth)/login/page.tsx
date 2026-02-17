"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@progress/kendo-react-buttons";
import { useAuthStore } from "@/stores/auth-store";

const inputClassName =
  "w-full rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-60";

export default function LoginPage() {
  const router = useRouter();
  const { logIn, isLoading, error, isAuthenticated } = useAuthStore();
  const [userName, setUserName] = useState("");
  const [userPassword, setUserPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userPassword) return;

    try {
      const result = await logIn(userName.trim(), userPassword);
      if (result?.result === 1) {
        router.push("/company-select");
      }
    } catch {
      // Error handled by store
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/company-select");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-lg font-medium text-white">
          Sign in to your account
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Enter your credentials to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label
            htmlFor="userName"
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            Username
          </label>
          <input
            id="userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="username"
            placeholder="Enter your username"
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="userPassword"
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            Password
          </label>
          <input
            id="userPassword"
            type="password"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
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
          disabled={isLoading || !userName.trim() || !userPassword}
          className="w-full"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="mt-6 flex flex-col gap-2 text-center sm:flex-row sm:justify-between">
        <Link
          href="/forgot-password"
          className="text-sm text-slate-400 hover:text-slate-300"
        >
          Forgot password?
        </Link>
        <Link
          href="/register"
          className="text-sm text-indigo-400 hover:text-indigo-300"
        >
          Create account
        </Link>
      </div>
    </>
  );
}
