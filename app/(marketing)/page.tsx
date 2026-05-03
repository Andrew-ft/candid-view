import Link from "next/link";
import { ArrowRight, Shield, Eye, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-white/50 glass">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-semibold text-primary tracking-tight">CandidView</span>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/signin"
              className="text-sm text-muted hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-white/60 transition-all"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm btn-primary px-4 py-2 rounded-lg font-medium"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-24 sm:pt-32 sm:pb-36">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Fair hiring, by design</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-tight mb-6">
              Sort and explain.
              <br />
              <span className="text-primary">Humans decide.</span>
            </h1>
            <p className="text-lg text-muted leading-relaxed mb-10 max-w-xl">
              CandidView uses AI to help recruiters give every candidate a fair
              look. Every match is explained. Every decision stays yours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 btn-primary px-6 py-3 rounded-lg font-medium"
              >
                Start screening as a recruiter
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/check"
                className="inline-flex items-center justify-center gap-2 bg-white/70 hover:bg-white/90 backdrop-blur-sm border border-white/70 text-foreground px-6 py-3 rounded-lg font-medium card-shadow hover:card-shadow-md transition-all"
              >
                Check your CV against a job
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Candidate check is free, instant, and requires no account.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Shield,
                title: "Fairness-first",
                body: "We check your job description for exclusionary language before you upload a single CV.",
              },
              {
                icon: Eye,
                title: "Total transparency",
                body: "Every AI recommendation comes with a plain-English explanation. No black box decisions.",
              },
              {
                icon: Users,
                title: "Human in the loop",
                body: "AI sorts and explains. You decide who moves forward. Override any recommendation in one click.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="glass rounded-2xl border border-white/60 p-6 card-shadow hover:card-shadow-md transition-all group"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 border-t border-white/50">
          <h2 className="text-2xl font-semibold text-foreground mb-12 text-balance">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                step: "01",
                title: "Paste your job description",
                body: "We analyse it for potentially exclusionary language and give you suggestions before you start screening.",
              },
              {
                step: "02",
                title: "Upload candidate CVs",
                body: "Drag and drop PDFs, Word docs, or plain text. We parse them automatically.",
              },
              {
                step: "03",
                title: "Review a ranked, explained dashboard",
                body: "Candidates are sorted into three tiers — with reasons. Nobody is hidden. Nobody is auto-rejected.",
              },
              {
                step: "04",
                title: "Override, note, decide",
                body: "Move candidates between tiers, add notes, and keep a full audit log of your decisions.",
              },
            ].map(({ step, title, body }) => (
              <div
                key={step}
                className="glass rounded-2xl border border-white/60 p-6 card-shadow"
              >
                <span className="text-3xl font-bold text-primary/25 block mb-3 tabular-nums">
                  {step}
                </span>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Candidate CTA */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="glass rounded-2xl border border-white/60 card-shadow-md p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Are you a candidate?
                </h2>
                <p className="text-sm text-muted max-w-md leading-relaxed">
                  Paste a job description and your CV to instantly see how well
                  you match — with suggestions on what to highlight. No account
                  needed.
                </p>
              </div>
              <Link
                href="/check"
                className="shrink-0 inline-flex items-center gap-2 btn-primary px-5 py-2.5 rounded-lg text-sm font-medium"
              >
                Check my match
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-white/50 mt-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-sm font-medium text-primary tracking-tight">CandidView</span>
          <span className="text-sm text-muted-foreground">AI assists. Humans decide.</span>
        </div>
      </footer>
    </div>
  );
}
