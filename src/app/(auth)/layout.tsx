export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[420px]">
            <div className="text-center mb-12">
              <div className="inline-flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-5 shadow-lg shadow-green-500/30">
                  <span className="text-3xl font-black text-black">Q</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Quiniela <span className="text-green-400">Mundial</span>
                </h1>
                <p className="text-sm text-zinc-500 mt-1.5 font-medium">2026 · USA · México · Canadá</p>
              </div>
            </div>
            
            {children}
          </div>
        </div>
      </div>
    )
  }
  