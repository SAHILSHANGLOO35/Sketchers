"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import router for navigation
import { Button } from "@/components/ui/Button";
import { Pencil, Shapes, Share2, Users2, Sparkles, ArrowRight, Zap, Code, BookOpen, PenTool, Layers, PanelRight, Palette, RefreshCw } from "lucide-react";
import Squares from "../components/Squares";

export default function Page() {
    const [scrolled, setScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 650;
            setScrolled(isScrolled);
        };

        const checkAuthStatus = () => {
            const token = localStorage.getItem('token');
            setIsLoggedIn(!!token);
        };

        window.addEventListener("scroll", handleScroll);
        checkAuthStatus();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Function to handle click on creation buttons
    const handleCreateClick = (e: any) => {
        e.preventDefault();
        if (isLoggedIn) {
            router.push('/dashboard');
        } else {
            router.push('/signin');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden">
            {/* Animated background - conditionally rendered based on scroll position */}
            <div
                className={`fixed inset-0 z-0 transition-opacity duration-700 ${scrolled ? "opacity-0" : "opacity-100"}`}
            >
                <Squares
                    speed={0.3}
                    squareSize={40}
                    direction="diagonal"
                    borderColor="rgba(75, 75, 75, 1)"
                    hoverFillColor="rgba(40, 40, 40, 0.8)"
                />
            </div>

            {/* Fallback background that appears when scrolled */}
            <div
                className={`fixed inset-0 z-0 transition-opacity duration-700 ${scrolled ? "opacity-100" : "opacity-0"}`}
            >
                <div className="absolute inset-0 bg-black" />
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-700/40 to-transparent" />
            </div>

            {/* Content wrapper */}
            <div className="relative z-10">
                {/* Navigation */}
                <header className="px-4 lg:px-8 h-16 flex items-center border-b border-zinc-800 backdrop-blur-sm sticky top-0 z-20 bg-zinc-900/80">
                    <Link
                        href="/"
                        className="flex items-center justify-center group"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-zinc-600 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                            <Pencil className="h-6 w-6 text-white relative" />
                        </div>
                        <span className="ml-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-200 to-white">
                            Sketcher
                        </span>
                    </Link>
                    <nav className="ml-auto flex gap-4 sm:gap-6">
                        <Link
                            href="#features"
                            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hover:underline underline-offset-4 decoration-zinc-500"
                        >
                            Features
                        </Link>
                        <Link
                            href="#working"
                            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hover:underline underline-offset-4 decoration-zinc-500"
                        >
                            How it works ?
                        </Link>
                        {isLoggedIn ? (
                            <Link
                                href="/dashboard"
                                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hover:underline underline-offset-4 decoration-zinc-500"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/signin"
                                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hover:underline underline-offset-4 decoration-zinc-500"
                            >
                                Sign in
                            </Link>
                        )}
                    </nav>
                </header>

                {/* Hero Section */}
                <section className="px-4 py-12 md:py-24 lg:py-32">
                    <div className="container px-4 md:px-6 relative">
                        {/* Decorative elements - more subtle */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 aspect-square bg-zinc-800/20 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-1/3 aspect-square bg-zinc-800/10 rounded-full blur-3xl" />

                        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                            <div className="flex flex-col justify-center space-y-4">
                                <div className="space-y-2 relative">
                                    <div className="inline-flex items-center rounded-full border border-zinc-700/30 bg-zinc-800/50 px-3 py-1 text-sm text-zinc-300 backdrop-blur-sm">
                                        <Sparkles className="mr-2 h-3.5 w-3.5" />
                                        The future of digital sketching
                                    </div>
                                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
                                        Where Creativity Meets Digital Canvas
                                    </h1>
                                    <p className="max-w-[600px] text-zinc-400 md:text-xl">
                                        Transform your ideas into reality with
                                        our powerful sketching tool. Create,
                                        collaborate, and bring your vision to
                                        life.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                    <Button
                                        size="lg"
                                        className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 group"
                                        onClick={handleCreateClick}
                                    >
                                        Start Creating
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                    {!isLoggedIn && (
                                        <Link href="/signup">
                                            <Button
                                                size="lg"
                                                variant="outline"
                                                className="border-zinc-700 text-white hover:bg-zinc-800/80 backdrop-blur-sm"
                                            >
                                                Sign up
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-zinc-700 to-zinc-600 blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                                <div className="relative h-full w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm p-4 transition-transform hover:scale-[1.01]">
                                    <div className="h-full w-full rounded-lg border border-zinc-800 p-4">
                                        {/* Canvas demo placeholder with grid */}
                                        <div className="relative h-full w-full">
                                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/5 to-zinc-800/5" />
                                            <div
                                                className="absolute inset-0"
                                                style={{
                                                    backgroundImage:
                                                        "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
                                                    backgroundSize: "20px 20px",
                                                }}
                                            />
                                            <div className="relative p-4 text-center">
                                                <span className="text-zinc-500 text-sm">
                                                    Interactive Canvas Demo
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Enhanced Features Section */}
                <section
                    id="features"
                    className="w-full py-12 md:py-24 lg:py-32 relative"
                >
                    <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-zinc-800/20 blur-3xl" />
                    <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-zinc-800/20 blur-3xl" />

                    <div className="container px-4 md:px-6 relative">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
                            <div className="inline-flex items-center rounded-full border border-zinc-700/50 bg-zinc-800/70 px-3 py-1 text-sm text-zinc-300 backdrop-blur-sm mb-2">
                                <Zap className="mr-2 h-3.5 w-3.5 text-zinc-200" />
                                Powerful capabilities
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                                    Powerful Features for Creative Minds
                                </h2>
                                <p className="max-w-[900px] text-zinc-400 md:text-xl">
                                    Everything you need to bring your ideas to
                                    life
                                </p>
                            </div>
                        </div>

                        {/* Main features grid with more details */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
                            {/* Feature cards with enhanced hover effects */}
                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-zinc-700 to-zinc-600 opacity-0 blur-xl transition-opacity group-hover:opacity-10" />
                                <div className="relative flex flex-col space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/80 p-6 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-zinc-600 h-full">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-700/30 ring-1 ring-zinc-600/25">
                                        <Shapes className="h-6 w-6 text-zinc-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">
                                        Smart Tools
                                    </h3>
                                    <p className="text-zinc-400">
                                        Intelligent drawing tools that adapt to
                                        your style and predict your next moves.
                                        Our AI-enhanced brushes learn from your
                                        techniques.
                                    </p>
                                </div>
                            </div>

                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-zinc-700 to-zinc-600 opacity-0 blur-xl transition-opacity group-hover:opacity-10" />
                                <div className="relative flex flex-col space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/80 p-6 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-zinc-600 h-full">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-700/30 ring-1 ring-zinc-600/25">
                                        <Users2 className="h-6 w-6 text-zinc-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">
                                        Live Collaboration
                                    </h3>
                                    <p className="text-zinc-400">
                                        Work together in real-time with your
                                        team. See changes instantly, add
                                        comments, and create together regardless
                                        of location.
                                    </p>
                                </div>
                            </div>

                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-zinc-700 to-zinc-600 opacity-0 blur-xl transition-opacity group-hover:opacity-10" />
                                <div className="relative flex flex-col space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/80 p-6 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-zinc-600 h-full">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-700/30 ring-1 ring-zinc-600/25">
                                        <Share2 className="h-6 w-6 text-zinc-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">
                                        Instant Sharing
                                    </h3>
                                    <p className="text-zinc-400">
                                        Share your work with one click to any
                                        platform. Generate presentation-ready
                                        exports and interactive demos for
                                        clients.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section (replacing testimonials/pricing) */}
                <section className="w-full py-12 md:py-24 lg:py-32 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black" />
                    <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-zinc-800/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-zinc-800/10 rounded-full blur-3xl" />

                    <div id="working" className="container relative px-4 md:px-6">
                        <div className="flex flex-col items-center text-center mb-16">
                            <div className="inline-flex items-center rounded-full border border-zinc-700/50 bg-zinc-800/70 px-3 py-1 text-sm text-zinc-300 backdrop-blur-sm mb-2">
                                <RefreshCw className="mr-2 h-3.5 w-3.5 text-zinc-200" />
                                Simple workflow
                            </div>
                            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent mb-4">
                                How Sketcher Works
                            </h2>
                            <p className="max-w-[800px] text-zinc-400 md:text-xl">
                                A streamlined process designed to help you
                                create without limitations
                            </p>
                        </div>

                        {/* How It Works Steps */}
                        <div className="grid gap-8 md:grid-cols-3 mb-16">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700">
                                    <span className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                                        1
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-white">
                                    Create Your Canvas
                                </h3>
                                <p className="text-zinc-400">
                                    Start with a blank canvas or choose from our
                                    wide selection of templates designed for
                                    various use cases.
                                </p>
                                <div className="mt-4 flex justify-center">
                                    <PenTool className="h-12 w-12 text-zinc-600" />
                                </div>
                            </div>

                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700">
                                    <span className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                                        2
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-white">
                                    Design & Iterate
                                </h3>
                                <p className="text-zinc-400">
                                    Use our powerful tools to bring your ideas
                                    to life. Edit, refine, and perfect your
                                    creation with intuitive controls.
                                </p>
                                <div className="mt-4 flex justify-center">
                                    <Layers className="h-12 w-12 text-zinc-600" />
                                </div>
                            </div>

                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700">
                                    <span className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                                        3
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-white">
                                    Share & Export
                                </h3>
                                <p className="text-zinc-400">
                                    Export your work in multiple formats or
                                    share directly with your team. Present your
                                    designs with confidence.
                                </p>
                                <div className="mt-4 flex justify-center">
                                    <Share2 className="h-12 w-12 text-zinc-600" />
                                </div>
                            </div>
                        </div>

                        {/* Additional information blocks */}
                        <div className="grid gap-6 md:grid-cols-2 mb-16">
                            <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
                                <PanelRight className="h-8 w-8 text-zinc-400 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Built for Professionals
                                </h3>
                                <p className="text-zinc-400">
                                    Whether you're an illustrator, UI/UX
                                    designer, or architect, Sketcher adapts to
                                    your workflow with specialized tools and
                                    features designed for your specific needs.
                                </p>
                            </div>

                            <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
                                <Palette className="h-8 w-8 text-zinc-400 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Limitless Creative Freedom
                                </h3>
                                <p className="text-zinc-400">
                                    Express yourself with an extensive library
                                    of brushes, shapes, and effects. Our tool is
                                    designed to feel natural while giving you
                                    the precision of digital creation.
                                </p>
                            </div>
                        </div>

                        {/* Resources Section */}
                        <div className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black p-8 backdrop-blur-sm">
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        Resources to Get You Started
                                    </h3>
                                    <p className="text-zinc-400 mb-4">
                                        Explore our comprehensive guides,
                                        tutorials, and documentation to help you
                                        make the most of Sketcher.
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        <div className="flex items-center gap-2 rounded-full bg-zinc-800/70 px-3 py-1 text-sm text-zinc-300">
                                            <BookOpen className="h-3.5 w-3.5" />
                                            Beginner Guides
                                        </div>
                                        <div className="flex items-center gap-2 rounded-full bg-zinc-800/70 px-3 py-1 text-sm text-zinc-300">
                                            <Code className="h-3.5 w-3.5" />
                                            API Documentation
                                        </div>
                                        <div className="flex items-center gap-2 rounded-full bg-zinc-800/70 px-3 py-1 text-sm text-zinc-300">
                                            <Sparkles className="h-3.5 w-3.5" />
                                            Tutorial Videos
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <Button
                                        size="lg"
                                        className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 group w-full"
                                        onClick={handleCreateClick}
                                    >
                                        Explore Resources
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Final CTA */}
                        <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-3xl mx-auto mt-16 py-8 px-4 border border-zinc-800 rounded-xl bg-gradient-to-b from-zinc-900 to-black">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                                    Start Creating Today
                                </h2>
                                <p className="max-w-[600px] text-zinc-400 md:text-xl">
                                    Begin your creative journey with Sketcher
                                    and transform how you bring ideas to life
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
                                <Button
                                    size="lg"
                                    className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 group w-full sm:w-auto"
                                    onClick={handleCreateClick}
                                >
                                    Get Started Free
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-zinc-700 text-white hover:bg-zinc-800/80 backdrop-blur-sm w-full sm:w-auto"
                                >
                                    Learn More
                                </Button>
                            </div>

                            <p className="text-xs text-zinc-500">
                                Try Sketchers and share your experience with us!
                            </p>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="w-full border-t border-zinc-800 bg-black/30 backdrop-blur-sm">
                    <div className="container flex flex-col gap-2 sm:flex-row py-6 w-full items-center px-4 md:px-6">
                        <p className="text-xs text-zinc-500">
                            © {new Date().getFullYear()} Sketcher. All rights
                            reserved.
                        </p>
                        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                            <Link
                                href="#"
                                className="text-xs text-zinc-500 hover:text-white transition-colors"
                            >
                                Terms
                            </Link>
                            <Link
                                href="#"
                                className="text-xs text-zinc-500 hover:text-white transition-colors"
                            >
                                Privacy
                            </Link>
                        </nav>
                    </div>
                </footer>
            </div>
        </div>
    );
}