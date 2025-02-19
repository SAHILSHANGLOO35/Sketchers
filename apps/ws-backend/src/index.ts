import { WebSocketServer } from "ws";
import jwt, { decode, JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

export interface RequestCustom extends Request {
    userId?: string
} 

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws, req: RequestCustom) {
    const url = req.url;
    if(!url) {
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get("token") || "";
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    if(typeof decoded === "string") {
        ws.close();
        return;
    }

    if(!decoded || !decoded.userId) {
        ws.close();
        return;
    }

    ws.on("message", function message(data) {
        ws.send("pong");
    });
});
