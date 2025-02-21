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

const users: User[] = [];

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

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws, req: RequestCustom) {
    try {
        const url = req.url;
        if (!url) {
            ws.close();
            return;
        }
        
        const queryParams = new URLSearchParams(url.split("?")[1]);
        const token = queryParams.get("token") || "";
        const userId = checkUser(token);

        if (!userId) {
            ws.close();
            return;
        }

        users.push({
            userId,
            rooms: [],
            ws,
        });

        ws.on("message", async function message(data) {
            try {
                const parsedData = JSON.parse(data as unknown as string);

                if (parsedData.type === "join_room") {
                    const user = users.find((user) => user.ws === ws);
                    user?.rooms.push(parsedData.roomId);
                }

                if (parsedData.type === "leave_room") {
                    const user = users.find((user) => user.ws === ws);
                    if (!user) return;
                    user.rooms = user.rooms.filter((room) => room !== parsedData.room);
                }

                if (parsedData.type === "chat") {
                    const { roomId, message } = parsedData;

                    await prismaClient.chat.create({
                        data: {
                            roomId,
                            message,
                            userId
                        }
                    });

                    users.forEach((user) => {
                        if (user.rooms.includes(roomId)) {
                            user.ws.send(
                                JSON.stringify({ type: "chat", message, roomId })
                            );
                        }
                    });
                }
            } catch (error) {
                console.error("Error processing message:", error);
            }
        });
    } catch (error) {
        console.error("WebSocket connection error:", error);
        ws.close();
    }
});