"use client";
import { BACKEND_URL, WS_URL } from "@/config";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PlusCircle, Loader2, Grid, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Background gradient */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-blue-900/20 to-purple-900/20 blur-3xl opacity-20 -z-10"></div>

            <div className="max-w-7xl mx-auto p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-white mb-1">
                            Your Rooms
                        </h1>
                        <p className="text-gray-500">
                            Manage and access your virtual spaces
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/create-room")}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-lg transition-all duration-200 shadow-lg shadow-blue-800/30"
                    >
                        <PlusCircle size={16} />
                        <span className="font-medium">Create New Room</span>
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 mt-8">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                        <span className="text-gray-400">
                            Loading your rooms...
                        </span>
                    </div>
                ) : rooms.length > 0 ? (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Grid size={18} className="text-gray-400" />
                                <span className="text-sm text-gray-400 font-medium">
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
                                    onClick={() =>
                                        // @ts-ignore
                                        router.push(`/canvas/${room.id}`)
                                    }
                                    className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-blue-700 hover:shadow-lg hover:shadow-blue-900/20 cursor-pointer group"
                                >
                                    <div className="px-6 py-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="bg-blue-600/20 rounded-full px-3 py-1">
                                                <span className="text-xs font-medium text-blue-400">
                                                    Room
                                                </span>
                                            </div>
                                            {/* <span className="text-xs text-gray-500">
                                                ID:{" "}
                                                {room.id?.substring(0, 8) ||
                                                    "N/A"}
                                            </span> */}
                                        </div>

                                        <h2 className="text-xl font-bold text-white mb-2 truncate group-hover:text-blue-400 transition-colors">
                                            {room.slug}
                                        </h2>

                                        <p className="text-gray-500 text-sm mb-6">
                                            Created on:{" "}
                                            {new Date(
                                                room.createdAt
                                            ).toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </p>

                                        <div className="flex justify-end mt-2">
                                            <div className="flex items-center text-blue-500 text-sm font-medium transition-all group-hover:translate-x-1">
                                                <span>Enter Room</span>
                                                <ChevronRight
                                                    size={16}
                                                    className="ml-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center bg-gray-950 border border-gray-800 rounded-xl py-16 px-8 mt-8 text-center">
                        <div className="rounded-full bg-blue-900/20 p-4 mb-4">
                            <PlusCircle size={28} className="text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            No Rooms Found
                        </h3>
                        <p className="text-gray-500 mb-6 max-w-md">
                            Create your first room to get started with your
                            virtual spaces
                        </p>
                        <a
                            href="/create-room"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium"
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
