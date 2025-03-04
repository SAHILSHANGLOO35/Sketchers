"use client"
import { BACKEND_URL } from "@/config";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async() => {
        setLoading(true);
        const endpoint = isSignin ? `${BACKEND_URL}/signin` : `${BACKEND_URL}/signup`;

        try {
            const res = await axios.post(endpoint, formData, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const data = await res.data;
            if(isSignin) {
                localStorage.setItem("token", data.token);
                window.location.href = "/dashboard"
            } else {
                setMessage("Signup successful! Please sign in");
                window.location.href = "/signin"
            }
        } catch (error) {
            setMessage("Something went wrong!");
        }
        setLoading(false);
    }

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
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-400"
                    />
                )}
                <input
                    type="text"
                    placeholder="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
                <input
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
                <button
                    onClick={handleSubmit}
                    className="w-full p-3 bg-violet-500 hover:bg-violet-600 transition text-white rounded-lg font-semibold"
                    disabled={loading}
                >
                    {loading ? "Loading..." : isSignin ? "Sign in" : "Sign up"}
                </button>
                {!isSignin && (
                    <div className="flex flex-row justify-center">
                        Already have an account? <span className="ml-2 hover:text-blue-500 hover:underline hover:cursor-pointer" onClick={() => {
                            router.push("/signin");
                        }}>Sign in</span>
                    </div>
                )}
                {isSignin && (
                    <div className="flex flex-row justify-center ">
                        Don't have an account? <span className="ml-2 hover:text-blue-500 hover:underline hover:cursor-pointer" onClick={() => {
                            router.push("/signup");
                        }}>Sign up</span>
                    </div>
                )}
                {message && <p className="text-red-600 text-center">{message}</p>}
            </div>
        </div>
    );
}
