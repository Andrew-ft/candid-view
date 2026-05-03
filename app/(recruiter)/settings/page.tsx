import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { redirect } from "next/navigation";
import DeleteAccountButton from "./DeleteAccountButton";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, createdAt: true },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-semibold text-foreground mb-8">Settings</h1>

      <section className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Account
        </h2>
        <dl className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <dt className="text-sm text-muted w-24 shrink-0">Name</dt>
            <dd className="text-sm text-foreground">{user?.name ?? "—"}</dd>
          </div>
          <div className="flex items-center gap-3">
            <dt className="text-sm text-muted w-24 shrink-0">Email</dt>
            <dd className="text-sm text-foreground">{user?.email}</dd>
          </div>
          <div className="flex items-center gap-3">
            <dt className="text-sm text-muted w-24 shrink-0">Member since</dt>
            <dd className="text-sm text-foreground">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="text-base font-semibold text-foreground mb-2">
          Anonymisation
        </h2>
        <p className="text-sm text-muted mb-4">
          When anonymised mode is on in the results dashboard, candidate names
          and personal details are hidden. This is a UI-only toggle — it
          doesn&apos;t affect your data.
        </p>
        <p className="text-xs text-muted-foreground">
          Anonymisation is toggled per-screening from the results dashboard.
        </p>
      </section>

      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-base font-semibold text-foreground mb-2">
          Data retention
        </h2>
        <p className="text-sm text-muted mb-4">
          Your screenings and candidate data are stored only in your local
          database. You can delete everything at any time.
        </p>
        <DeleteAccountButton />
      </section>
    </div>
  );
}
