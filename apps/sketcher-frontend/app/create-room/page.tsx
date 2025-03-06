"use client";

import { BACKEND_URL } from "../../config";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Loader2, ArrowLeft, Home } from "lucide-react";

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
            console.log(res);

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
        <div className="min-h-screen bg-black text-white">
            {/* Background gradient */}
            <div className="absolute top-0 right-0 w-1/2 h-96 bg-blue-900/10 blur-3xl opacity-20 -z-10"></div>

            <div className="max-w-7xl mx-auto p-6 sm:p-8">
                {/* Header section that matches dashboard layout */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-900 hover:bg-gray-800 transition-colors"
                            aria-label="Back to Dashboard"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-white mb-1">
                                Create a New Room
                            </h1>
                            <p className="text-gray-500 pl-1">
                                Set up a new collaborative space
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push("/dashboard")}
                        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-5 py-3 rounded-lg transition-all duration-200"
                    >
                        <Home size={16} />
                        <span className="font-medium">Dashboard</span>
                    </button>
                </div>

                {/* Form section */}
                <div className="max-w-3xl mx-auto">
                    <div className="bg-gray-950 border border-gray-800 rounded-xl p-8 shadow-lg">
                        <div className="mb-6">
                            <label
                                htmlFor="roomName"
                                className="block text-sm font-medium text-gray-400 mb-2"
                            >
                                Room Name
                            </label>
                            <input
                                id="roomName"
                                type="text"
                                placeholder="Enter a name for your room"
                                value={roomName}
                                onChange={(e) => {
                                    setRoomName(e.target.value);
                                    if (e.target.value.trim()) setError(false);
                                }}
                                className={`w-full bg-gray-900 text-white p-4 border ${
                                    error ? "border-red-500" : "border-gray-700"
                                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all`}
                            />
                            {error && (
                                <p className="mt-2 text-sm text-red-500">
                                    {message}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between mt-8">
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={createRoom}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:hover:bg-blue-600 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus size={18} />
                                        <span>Create Room</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-gray-500 text-sm">
                        <p>
                            Once created, you'll be redirected to your new
                            canvas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
