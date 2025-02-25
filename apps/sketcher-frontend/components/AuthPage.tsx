export function AuthPage({ isSignin }: { isSignin: boolean }) {
    return (
        <div className="w-screen h-screen flex justify-center items-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-950/70 via-slate-950 to-slate-950"></div>
            <div className="relative p-8 w-96 h-96 bg-white/10 backdrop-blur-lg backdrop-opacity-50 rounded-lg shadow-lg flex flex-col gap-4 border border-white/20">
                <span className="flex justify-center mb-2 font-semibold text-xl">
                    Welcome to SKETCHER
                </span>
                {!isSignin && (
                    <input
                        type="text"
                        placeholder="Username"
                        className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-400"
                    />
                )}
                <input
                    type="text"
                    placeholder="Email"
                    className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
                <button className="w-full p-3 bg-violet-500 hover:bg-violet-600 transition text-white rounded-lg font-semibold">
                    {isSignin ? "Sign in" : "Sign up"}
                </button>
            </div>
        </div>
    );
}
