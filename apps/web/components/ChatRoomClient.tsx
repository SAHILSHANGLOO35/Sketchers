"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export function ChatRoomClient({
    messages,
    id
}: {
    messages: { message: string }[];
    id: string;
}) {
    const [chats, setChats] = useState(messages);
    const [currentMessage, setCurrentMessage] = useState("");
    const { socket, loading } = useSocket();

    useEffect(() => {
        if (!socket || loading) return;

        socket.send(
            JSON.stringify({
                type: "join_room",
                roomId: id
            })
        );

        const handleMessage = (event: MessageEvent) => {
            const parsedData = JSON.parse(event.data);
            if (parsedData.type === "chat") {
                setChats((prev) => [...prev, { message: parsedData.message }]);
            }
        };

        socket.addEventListener("message", handleMessage);

        return () => {
            socket.removeEventListener("message", handleMessage);
        };
    }, [socket, loading, id]);

    const sendMessage = () => {
        if (!currentMessage.trim() || !socket) return;

        socket.send(
            JSON.stringify({
                type: "chat",
                roomId: id,
                message: currentMessage
            })
        );
        setCurrentMessage("");
    };

    return (
        <div style={{ maxWidth: "400px", margin: "auto", padding: "10px", border: "1px solid #ccc", borderRadius: "8px" }}>
            <div style={{ height: "300px", overflowY: "auto", padding: "10px", background: "#f9f9f9" }}>
                {chats.map((m, index) => (
                    <div key={index} style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                        {m.message}
                    </div>
                ))}
            </div>

            <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                style={{ width: "100%", padding: "8px", marginTop: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                placeholder="Type a message..."
            />
        </div>
    );
}
