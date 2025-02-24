import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
const JWT_SECRET = process.env.JWT_SECRET;
import {
    UserSignupSchema,
    UserSigninSchema,
    RoomSchema,
} from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import bcrypt, { hash } from "bcrypt";
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";

const app = express();
app.use(express.json());

export interface RequestCustom extends Request {
    body: {
        email: string;
        password: string;
    };
}

app.post("/signup", async (req, res) => {
    const parsedData = UserSignupSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(403).json({
            message: "Incorrect inputs",
        });
        return;
    }

    try {
        const { username, email, password } = parsedData.data;

        const user = await prismaClient.user.findUnique({
            where: {
                email,
            },
        });

        if (user) {
            res.status(403).json({
                message: "User with this username or email already exists!",
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prismaClient.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });
        res.status(200).json({
            message: "User signed-up successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Some internal error while signing up the user",
        });
    }
});

app.post("/signin", async (req: RequestCustom, res: any) => {
    const parsedData = UserSigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(403).json({
            message: "Incorrect inputs",
        });
        return;
    }

    try {
        const { email, password } = parsedData.data;

        const user = await prismaClient.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            res.status(403).json({
                mesage: "User not found",
            });
            return;
        }

        const passwordMatch = await bcrypt.compare(password, user?.password);

        if (!passwordMatch) {
            res.status(403).json({
                message: "Invalid credentials",
            });
            return;
        }

        const token = jwt.sign(
            {
                userId: user.id,
            },
            process.env.JWT_SECRET as string
        );

        res.json({
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Some internal error while signing in the user",
        });
    }
});

app.post("/create-room", middleware, async (req, res) => {
    const parsedData = RoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(403).json({
            message: "Incorrect inputs",
        });
        return;
    }

    try {
        // @ts-ignore
        const userId = req.userId;

        const room = await prismaClient.room.findFirst({
            where: {
                slug: parsedData.data.roomName,
            },
        });

        if (room) {
            res.status(403).json({
                message: "Room with this name already exists!",
            });
            return;
        }

        const newRoom = await prismaClient.room.create({
            data: {
                slug: parsedData.data.roomName,
                adminId: userId,
            },
        });

        res.status(200).json({
            roomId: newRoom.id,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Some internal error while creating room",
        });
    }
});

app.get("/chats/:roomId", async (req: any, res: any) => {
    try {
        const roomId = Number(req.params.roomId);

        if (isNaN(roomId) || roomId <= 0) {
            return res.status(400).json({ error: "Invalid room ID" });
        }

        const messages = await prismaClient.chat.findMany({
            where: { roomId },
            orderBy: { id: "desc" },
            take: 50
        });

        res.status(200).json({ messages });
    } catch (error) {
        console.error("Error fetching chats:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/room/:slug", async (req: any, res: any) => {
    try {
        const slug = req.params.slug;

        const room = await prismaClient.room.findMany({
            where: { slug },
        });

        res.status(200).json({ room });
    } catch (error) {
        console.error("Error fetching room:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.listen(process.env.PORT);