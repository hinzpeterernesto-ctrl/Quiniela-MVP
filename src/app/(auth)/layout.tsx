export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary mb-4">
              <span className="text-2xl font-black text-primary-foreground">Q</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Quiniela <span className="text-primary">2026</span></h1>
            <p className="text-sm text-muted-foreground mt-1">Mundial de Fútbol 2026</p>
          </div>
          {children}
        </div>
      </div>
    )
  }
  