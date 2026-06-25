"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Stub login (D-002). B2 replaces with the real Azure AD button.
export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onLogin() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/stub-login", { method: "POST" });
    if (res.ok) {
      router.push("/inspections/new");
      router.refresh();
    } else {
      setError("ไม่สามารถเข้าสู่ระบบได้");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-6">
      <div className="w-full max-w-sm rounded-lg border border-line bg-card p-8 shadow-md">
        <h1 className="text-center text-2xl font-semibold text-fg">CIS — ABC ประกันภัย</h1>
        <p className="mt-1 text-center text-sm text-fg-muted">ระบบตรวจสภาพรถยนต์</p>
        <div className="mt-6">
          <Button className="w-full" onClick={onLogin} disabled={loading}>
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบด้วย Microsoft (stub)"}
          </Button>
        </div>
        {error && (
          <p className="mt-3 text-center text-sm text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
