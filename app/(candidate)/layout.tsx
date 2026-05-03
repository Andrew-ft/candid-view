export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 border-b border-white/50 glass">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          <a href="/" className="text-base font-semibold text-primary tracking-tight">
            CandidView
          </a>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <p className="text-xs text-muted-foreground text-center">
            CandidView — AI assists. Humans decide.
          </p>
        </div>
      </footer>
    </div>
  );
}
