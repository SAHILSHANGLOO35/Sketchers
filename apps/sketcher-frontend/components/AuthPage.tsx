"use client";
import { BACKEND_URL } from "@/config";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Squares from "./Squares";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setLoading(true);
        const endpoint = isSignin
            ? `${BACKEND_URL}/signin`
            : `${BACKEND_URL}/signup`;

        try {
            const res = await axios.post(endpoint, formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.data;
            if (isSignin) {
                localStorage.setItem("token", data.token);
                window.location.href = "/dashboard";
            } else {
                setMessage("Signup successful! Please sign in");
                window.location.href = "/signin";
            }
        } catch (error) {
            setMessage("Something went wrong!");
        }
        setLoading(false);
    };

    return (
        <div className="w-screen h-screen flex justify-center items-center relative bg-black">
            <div className="absolute inset-0 overflow-hidden">
                <Squares
                    speed={0.3}
                    squareSize={40}
                    direction="diagonal"
                    borderColor="rgba(75, 75, 75, 1)"
                    hoverFillColor="rgba(40, 40, 40, 0.8)"
                />
            </div>

            <div className="relative z-10 max-w-md w-full px-8 py-10 bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 transform transition-all duration-300 hover:shadow-zinc-800/50">
                <div className="flex flex-col items-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {isSignin ? "Welcome Back" : "Join SKETCHER"}
                    </h1>
                    <div className="w-16 h-1 bg-zinc-700 rounded-full"></div>
                </div>

                <form className="space-y-5">
                    {!isSignin && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400 pl-1">
                                Username
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Enter your username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full p-3 pl-4 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all duration-200"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400 pl-1">
                            Email
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-3 pl-4 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all duration-200"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400 pl-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="Enter your password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full p-3 pl-4 bg-zinc-800/80 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all duration-200"
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="w-full p-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold shadow-lg shadow-black/30 transform transition-all duration-200 border border-zinc-700 hover:border-zinc-600"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                                <span>Processing...</span>
                            </div>
                        ) : isSignin ? (
                            "Sign In"
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-zinc-500">
                    {isSignin ? (
                        <div>
                            Don't have an account?{" "}
                            <span
                                className="text-zinc-400 hover:text-white font-medium cursor-pointer transition-colors duration-200"
                                onClick={() => router.push("/signup")}
                            >
                                Sign up
                            </span>
                        </div>
                    ) : (
                        <div>
                            Already have an account?{" "}
                            <span
                                className="text-zinc-400 hover:text-white font-medium cursor-pointer transition-colors duration-200"
                                onClick={() => router.push("/signin")}
                            >
                                Sign in
                            </span>
                        </div>
                    )}
                </div>

                {message && (
                    <div
                        className={`mt-4 p-3 rounded-lg text-center text-sm font-medium ${message.includes("successful") ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}
                    >
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
