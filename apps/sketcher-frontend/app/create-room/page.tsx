"use client";

import { BACKEND_URL } from "../../config";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import Squares from "../../components/Squares"; // Adjust the import path as needed

export default function CreateRoom() {
    const [roomName, setRoomName] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);

    const router = useRouter();

    const createRoom = async () => {
        if (!roomName.trim()) {
            setError(true);
            setMessage("Please enter a room name");
            return;
        }

        setLoading(true);
        setError(false);

        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/signin";
            return;
        }

        try {
            const res = await axios.post(
                `${BACKEND_URL}/create-room`,
                { roomName: roomName },
                {
                    headers: {
                        Authorization: token,
                    },
                }
            );

            const roomId = res.data.roomId;
            setMessage(res.data.message);

            router.push(`/canvas/${roomId}`);
        } catch (error) {
            console.error("Error creating room", error);
            setMessage("Error creating room");
            setError(true);
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
                        Create a New Room
                    </h1>
                    <div className="w-16 h-1 bg-zinc-700 rounded-full"></div>
                </div>

                <form className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400 pl-1">
                            Room Name
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Enter a name for your room"
                                value={roomName}
                                onChange={(e) => {
                                    setRoomName(e.target.value);
                                    if (e.target.value.trim()) setError(false);
                                }}
                                className={`w-full p-3 pl-4 bg-zinc-800/80 border ${
                                    error ? "border-red-500" : "border-zinc-700"
                                } rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all duration-200`}
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={createRoom}
                        className="w-full p-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold shadow-lg shadow-black/30 transform transition-all duration-200 border border-zinc-700 hover:border-zinc-600"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                                <span>Creating Room...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <Plus size={18} />
                                <span>Create Room</span>
                            </div>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-zinc-500">
                    <div>
                        Return to{" "}
                        <span
                            className="text-zinc-400 hover:text-white font-medium cursor-pointer transition-colors duration-200"
                            onClick={() => router.push("/dashboard")}
                        >
                            Dashboard
                        </span>
                    </div>
                </div>

                {message && (
                    <div
                        className={`mt-4 p-3 rounded-lg text-center text-sm font-medium ${
                            error 
                                ? "bg-red-900/30 text-red-400" 
                                : "bg-green-900/30 text-green-400"
                        }`}
                    >
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}