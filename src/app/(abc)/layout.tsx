import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";

// Protected-route guard for all ABC screens (D-002). Minimal shell;
// the full golden app-shell (topbar+sidebar+footer, RBAC nav) is built in B1.
export default async function AbcLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-line bg-card px-6 py-3">
        <span className="font-semibold text-fg">CIS — ระบบตรวจสภาพรถยนต์</span>
        <span className="text-sm text-fg-muted">
          {user.displayName} · {user.role.name}
        </span>
      </header>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
