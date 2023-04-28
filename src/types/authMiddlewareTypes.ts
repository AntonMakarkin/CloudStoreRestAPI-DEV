import { ObjectId } from "mongoose";

export type authMiddleware = {
    token: string;
    user: {
        _id: string;
        email: string;
        diskSpace: number;
        usedSpace: number;
        files: ObjectId[];
    }
}