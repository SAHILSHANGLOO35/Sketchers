import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Pencil, Shapes, Share2, Users2, Sparkles, ArrowRight } from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-slate-950 to-slate-950" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Navigation */}
        <header className="px-4 lg:px-6 h-16 flex items-center border-b border-white/5 backdrop-blur-sm">
          <Link href="/" className="flex items-center justify-center group">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-600 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <Pencil className="h-6 w-6 text-white relative" />
            </div>
            <span className="ml-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-violet-200">
              Sketcher
            </span>
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link
              href="#features"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors hover:underline underline-offset-4 decoration-violet-500"
            >
              Features
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors hover:underline underline-offset-4 decoration-violet-500"
            >
              Docs
            </Link>
            <Link
              href={"/signin"}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors hover:underline underline-offset-4 decoration-violet-500"
            >
              Sign in
            </Link>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="px-4 py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 relative">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 aspect-square bg-violet-600/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-1/3 aspect-square bg-blue-600/20 rounded-full blur-3xl" />

            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2 relative">
                  <div className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/5 px-3 py-1 text-sm text-violet-300 backdrop-blur-sm">
                    <Sparkles className="mr-2 h-3.5 w-3.5" />
                    The future of digital sketching
                  </div>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent">
                    Where Creativity Meets Digital Canvas
                  </h1>
                  <p className="max-w-[600px] text-white/70 md:text-xl">
                    Transform your ideas into reality with our powerful sketching tool. Create, collaborate, and bring
                    your vision to life.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="bg-violet-600 hover:bg-violet-600/90 text-white group">
                    Start Creating
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Link href={"/signup"}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-violet-500/20 text-white hover:bg-violet-500/10 backdrop-blur-sm"
                    >
                      Sign up
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-blue-600 blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm p-4 transition-transform hover:scale-[1.01]">
                  <div className="h-full w-full rounded-lg border border-white/10 p-4">
                    {/* Canvas demo placeholder with grid */}
                    <div className="relative h-full w-full">
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-blue-500/5" />
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
                          backgroundSize: "20px 20px",
                        }}
                      />
                      <div className="relative p-4 text-center">
                        <span className="text-white/50 text-sm">Interactive Canvas Demo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 relative">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                  Powerful Features for Creative Minds
                </h2>
                <p className="max-w-[900px] text-white/70 md:text-xl">
                  Everything you need to bring your ideas to life
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              {/* Feature cards with hover effects */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-violet-400 opacity-0 blur-xl transition-opacity group-hover:opacity-20" />
                <div className="relative flex flex-col items-center space-y-4 rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-transform hover:scale-105">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-600/10 ring-1 ring-violet-600/25">
                    <Shapes className="h-6 w-6 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Smart Tools</h3>
                  <p className="text-center text-white/70">Intelligent drawing tools that adapt to your style</p>
                </div>
              </div>
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 blur-xl transition-opacity group-hover:opacity-20" />
                <div className="relative flex flex-col items-center space-y-4 rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-transform hover:scale-105">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/10 ring-1 ring-blue-600/25">
                    <Users2 className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Live Collaboration</h3>
                  <p className="text-center text-white/70">Work together in real-time with your team</p>
                </div>
              </div>
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-blue-400 opacity-0 blur-xl transition-opacity group-hover:opacity-20" />
                <div className="relative flex flex-col items-center space-y-4 rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-transform hover:scale-105">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-600/10 ring-1 ring-violet-600/25">
                    <Share2 className="h-6 w-6 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Instant Sharing</h3>
                  <p className="text-center text-white/70">Share your work with one click</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-600/20 via-transparent to-transparent" />
          <div className="container relative px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                  Start Creating Today
                </h2>
                <p className="max-w-[600px] text-white/70 md:text-xl">
                  Join thousands of creators who trust Sketcher for their creative journey
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="bg-violet-600 hover:bg-violet-600/90 text-white group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full border-t border-white/5 bg-black/30 backdrop-blur-sm">
          <div className="container flex flex-col gap-2 sm:flex-row py-6 w-full items-center px-4 md:px-6">
            <p className="text-xs text-white/50">© {new Date().getFullYear()} Sketcher. All rights reserved.</p>
            <nav className="sm:ml-auto flex gap-4 sm:gap-6">
              <Link href="#" className="text-xs text-white/50 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-xs text-white/50 hover:text-white transition-colors">
                Privacy
              </Link>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  )
}

