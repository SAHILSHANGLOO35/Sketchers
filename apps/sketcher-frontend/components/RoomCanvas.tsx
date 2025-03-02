"use client";

import { WS_URL } from "@/config";
import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({roomId}: {
    roomId: string
}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNzU2YjQ0YS1lYjE5LTQyYWItOGVhMy1kYjBmN2I2ZDFjMTAiLCJpYXQiOjE3NDA5NDQ5Njl9.sesefI8WmAyVdPJscF2Vi872rNgC-zZe_nyjTc4pf0g`);

        ws.onopen = () => {
            setSocket(ws);
            ws.send(JSON.stringify({
                type: "join_room",
                roomId
            }))
        }
    }, []);

    if(!socket) {
        return <div>
            Connecting to the server...
        </div>
    }

    return (
        <div>
            <Canvas roomId={roomId} socket={socket} />
        </div>
    );
}