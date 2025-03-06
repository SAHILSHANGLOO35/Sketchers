"use client";
import { BACKEND_URL } from "@/config";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PlusCircle, Loader2, Grid, ChevronRight } from "lucide-react";
import Squares from "../../components/Squares";

export default function Dashboard() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creatingRoom, setCreatingRoom] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const fetchRooms = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/signin");
                return;
            }

            try {
                const res = await axios.get(`${BACKEND_URL}/all-rooms`, {
                    headers: {
                        Authorization: token,
                    },
                });

                const data = res.data;
                if (data) {
                    setRooms(data.rooms);
                }
            } catch (error) {
                console.error("Error fetching rooms", error);
            }
            setLoading(false);
        };

        fetchRooms();
    }, []);

    const handleCreateRoom = async () => {
        setCreatingRoom(true);
        await router.push("/create-room");
        setCreatingRoom(false);
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

            <div className="max-w-7xl top-0 left-0 right-0 mx-auto p-6 sm:p-8 absolute z-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-white mb-1">
                            Your Rooms
                        </h1>
                        <p className="text-zinc-400">
                            Manage and access your virtual spaces
                        </p>
                    </div>
                    <button
                        onClick={handleCreateRoom}
                        disabled={creatingRoom}
                        className={`flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-3 rounded-lg transition-all duration-200 shadow-lg border border-zinc-700 hover:border-zinc-600 ${
                            creatingRoom ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {creatingRoom ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <PlusCircle size={16} />
                        )}
                        <span className="font-medium">
                            {creatingRoom ? "Creating..." : "Create New Room"}
                        </span>
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 mt-8">
                        <Loader2 className="w-10 h-10 text-zinc-400 animate-spin mb-4" />
                        <span className="text-zinc-500">
                            Loading your rooms...
                        </span>
                    </div>
                ) : rooms.length > 0 ? (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Grid color="#d4d4d8" size={18} className="text-zinc-500" />
                                <span className="text-sm text-zinc-300 font-medium">
                                    {rooms.length}{" "}
                                    {rooms.length === 1 ? "Room" : "Rooms"}{" "}
                                    Available
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rooms.map((room) => (
                                <div
                                    // @ts-ignore
                                    key={room.id}
                                    // @ts-ignore
                                    onClick={() => router.push(`/canvas/${room.id}`)}
                                    className="bg-zinc-900/80 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden transition-all duration-300 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20 cursor-pointer group"
                                >
                                    <div className="px-6 py-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="bg-zinc-800 rounded-full px-3 py-1">
                                                <span className="text-xs font-medium text-zinc-400">
                                                    Room
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <h2 className="text-xl font-bold text-white mb-2 truncate group-hover:text-zinc-300 transition-colors">
                                            {/* @ts-ignore */}
                                            {room.slug}
                                        </h2>

                                        <p className="text-zinc-500 text-sm mb-6">
                                            Created on:{" "}
                                            {/* @ts-ignore */}
                                            {new Date(room.createdAt).toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </p>

                                        <div className="flex justify-end mt-2">
                                            <div className="flex items-center text-zinc-400 text-sm font-medium transition-all group-hover:translate-x-1 group-hover:text-white">
                                                <span>Enter Room</span>
                                                <ChevronRight size={16} className="ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-xl py-16 px-8 mt-8 text-center">
                        <div className="rounded-full bg-zinc-800 p-4 mb-4">
                            <PlusCircle size={28} className="text-zinc-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            No Rooms Found
                        </h3>
                        <p className="text-zinc-500 mb-6 max-w-md">
                            Create your first room to get started with your
                            virtual spaces
                        </p>
                        <a
                            href="/create-room"
                            className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium border border-zinc-700 hover:border-zinc-600"
                        >
                            <PlusCircle size={16} />
                            <span>Create Your First Room</span>
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
