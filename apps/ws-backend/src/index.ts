import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { prismaClient } from "@repo/db/client";

interface RequestCustom extends Request {
    userId?: string;
}

interface User {
    userId: string;
    rooms: string[];
    ws: WebSocket;
}

let users: User[] = [];

function checkUser(token: string): string | null {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        if (typeof decoded === "string" || !decoded?.userId) {
            return null;
        }
        return decoded.userId;
    } catch (error) {
        console.error("JWT verification failed:", error);
        return null;
    }
}

const wss = new WebSocketServer({ port: 9000 });

wss.on("connection", function connection(ws, req: RequestCustom) {
    try {
        const url = req.url || "";
        const queryParams = new URLSearchParams(url.split("?")[1]);
        const token = queryParams.get("token") || "";
        const userId = checkUser(token);

        if (!userId) {
            ws.close();
            return;
        }

        // Remove old connection if the user reconnects
        users = users.filter((user) => user.userId !== userId);
        users.push({ userId, rooms: [], ws });

        ws.on("message", async function message(data) {
            try {
                const parsedData = JSON.parse(data.toString());
                console.log("Parsed JSON:", parsedData);

                const user = users.find((u) => u.ws === ws);
                if (!user) return;

                if (parsedData.type === "join_room") {
                    user.rooms.push(parsedData.roomId);
                    console.log(`User ${user.userId} joined room: ${parsedData.roomId}`);
                }

                if (parsedData.type === "leave_room") {
                    user.rooms = user.rooms.filter((room) => room !== parsedData.roomId);
                }

                if (parsedData.type === "chat") {
                    const { roomId, message } = parsedData;
                    console.log(`Broadcasting message to room ${roomId}`);
                    console.log("Current users and their rooms:", users.map(u => ({ userId: u.userId, rooms: u.rooms })));

                    await prismaClient.chat.create({
                        data: {
                            roomId,
                            message,
                            userId: user.userId
                        }
                    });
                    console.log(`Broadcasting message to room: ${roomId}`);

                    users.forEach((u) => {
                        if (u.rooms.includes(roomId)) {
                            console.log(`Sending message to ${u.userId}`);
                            u.ws.send(JSON.stringify({ type: "chat", message, roomId }));
                        }
                    });
                }
            } catch (error) {
                console.error("Error processing message:", error);
            }
        });

        ws.on("close", () => {
            users = users.filter((u) => u.ws !== ws);
            console.log(`User ${userId} disconnected`);
        });

    } catch (error) {
        console.error("WebSocket connection error:", error);
        ws.close();
    }
});
