import { z } from "zod";

export const UserSignupSchema = z.object({
    username: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(6).max(20)
})

export const UserSigninSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(20)
})

export const RoomSchema = z.object({
    roomName: z.string().min(4).max(20)
})