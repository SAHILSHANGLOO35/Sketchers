import dotenv from "dotenv";
dotenv.config({  path: "./.env" });
const JWT_SECRET = process.env.JWT_SECRET;
import { UserSignupSchema, UserSigninSchema, RoomSchema } from "@repo/common/types";

import express from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";


const app = express();

app.use(express.json());

app.post("/signup", (req, res) => {
    const data = UserSignupSchema.safeParse(req.body);
    if(!data.success) {
        res.status(403).json({
            message: "Incorrect inputs"
        });
        return;
    }

    res.json({
        userId: "123"
    })
});

app.post("/signin", (req, res) => {
    const data = UserSigninSchema.safeParse(req.body);
    if(!data.success) {
        res.status(403).json({
            message: "Incorrect inputs"
        });
        return;
    }

    const userId = 1;
    const token = jwt.sign({
        userId
    }, JWT_SECRET as string);

    res.json({
        token
    });
})

app.post("/create-room", middleware, (req, res) => {
    const data = RoomSchema.safeParse(req.body);
    if(!data.success) {
        res.status(403).json({
            message: "Incorrect inputs"
        });
        return;
    }
    res.json({
        
    })
})

app.listen(process.env.PORT || 3000);