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

export interface RequestCustom extends Request
{
    body: {
        email: string;
        password: string;
    }
}

app.post("/signup", async (req, res) => {
    const data = UserSignupSchema.safeParse(req.body);
    if (!data.success) {
        res.status(403).json({
            message: "Incorrect inputs",
        });
        return;
    }

    try {
        const { username, email, password } = data.data;

        const user = await prismaClient.user.findUnique({
            where: {
                email
            }
        });

        if(user) {
            res.status(403).json({
                message: "User already exits!"
            });
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
    const data = UserSigninSchema.safeParse(req.body);
    if (!data.success) {
        res.status(403).json({
            message: "Incorrect inputs",
        });
        return;
    }

    try {
        const { email, password } = data.data;

        const user = await prismaClient.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return res.status(403).json({
                mesage: "User not found",
            });
        }

        const passwordMatch = await bcrypt.compare(password, user?.password);

        if (!passwordMatch) {
            return res.status(403).json({
                message: "Invalid credentials",
            });
        }

        const token = jwt.sign(
            {
                userId: user.id,
            },
            process.env.JWT_SECRET as string
        );

        res.json({
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Some internal error while signing in the user",
        });
    }
});

app.post("/create-room", middleware, (req, res) => {
    const data = RoomSchema.safeParse(req.body);
    if (!data.success) {
        res.status(403).json({
            message: "Incorrect inputs",
        });
        return;
    }
    res.json({});
});

app.listen(process.env.PORT || 3000);
