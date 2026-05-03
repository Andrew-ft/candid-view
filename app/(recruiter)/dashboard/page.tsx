import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Users, Calendar, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const screenings = await prisma.screening.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { candidates: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Screenings</h1>
          <p className="text-sm text-muted mt-1">
            Your active and past candidate screenings.
          </p>
        </div>
        <Link
          href="/screenings/new"
          className="flex items-center gap-2 btn-primary px-4 py-2.5 rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New screening
        </Link>
      </div>

      {screenings.length === 0 ? (
        <div className="glass rounded-2xl border border-white/60 card-shadow p-16 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-base font-semibold text-foreground mb-2">
            No screenings yet
          </h2>
          <p className="text-sm text-muted max-w-sm mb-7 leading-relaxed">
            Create your first screening to start matching candidates to a role.
            We&apos;ll check your job description for fairness issues first.
          </p>
          <Link
            href="/screenings/new"
            className="flex items-center gap-2 btn-primary px-5 py-2.5 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Create first screening
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {screenings.map((screening) => (
            <Link
              key={screening.id}
              href={`/screenings/${screening.id}`}
              className="glass rounded-xl border border-white/60 px-5 py-4 flex items-center justify-between gap-4 card-shadow hover:card-shadow-md transition-all group"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {screening.jobTitle}
                </h3>
                <div className="flex items-center gap-4 mt-1.5">
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <Users className="w-3.5 h-3.5" />
                    {screening._count.candidates} candidate
                    {screening._count.candidates !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(screening.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
