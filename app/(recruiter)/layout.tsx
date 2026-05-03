import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Plus, Settings, LogOut } from "lucide-react";
import { signOut } from "@/auth";

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden sm:flex flex-col w-56 border-r border-white/60 glass shrink-0 sticky top-0 h-screen">
        <div className="h-16 flex items-center px-5 border-b border-white/50">
          <Link href="/dashboard" className="text-base font-semibold text-primary tracking-tight">
            CandidView
          </Link>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-0.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:bg-white/60 hover:text-foreground transition-all"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/screenings/new"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:bg-white/60 hover:text-foreground transition-all"
          >
            <Plus className="w-4 h-4" />
            New screening
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:bg-white/60 hover:text-foreground transition-all"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </nav>
        <div className="p-3 border-t border-white/50">
          <div className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted mb-0.5">
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary shrink-0 ring-1 ring-primary/20">
              {session.user.name?.[0]?.toUpperCase() ?? session.user.email?.[0]?.toUpperCase() ?? "?"}
            </div>
            <span className="truncate text-xs font-medium">{session.user.name ?? session.user.email}</span>
          </div>
          <form
            action={async () => {
              "use server";
              const { headers } = await import("next/headers");
              const h = await headers();
              const host = h.get("x-forwarded-host") || h.get("host") || "";
              const proto = h.get("x-forwarded-proto") || "https";
              await signOut({ redirectTo: `${proto}://${host}/` });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:bg-white/60 hover:text-foreground transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="sm:hidden fixed top-0 left-0 right-0 h-14 glass border-b border-white/50 flex items-center justify-between px-4 z-10">
        <Link href="/dashboard" className="text-base font-semibold text-primary tracking-tight">
          CandidView
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/screenings/new" className="p-2 hover:bg-white/60 rounded-lg transition-all">
            <Plus className="w-5 h-5 text-muted" />
          </Link>
          <Link href="/settings" className="p-2 hover:bg-white/60 rounded-lg transition-all">
            <Settings className="w-5 h-5 text-muted" />
          </Link>
        </div>
      </div>

      <main className="flex-1 sm:pt-0 pt-14 overflow-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
