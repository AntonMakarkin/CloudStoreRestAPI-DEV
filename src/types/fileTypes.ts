import { ObjectId } from "mongoose";
import { Request } from "express";

export interface FileInterface {
    name: string;
    type: string;
    accessLink: string;
    size: number;
    path: string;
    user: ObjectId;
    parent: ObjectId;
    children: ObjectId[];
}

export interface searchFileRequest extends Request {
    token: string;
    user: {
        _id: string;
        email: string;
        diskSpace: number;
        usedSpace: number;
        files: ObjectId[];
    }
    query: {
        search: string;
    }
};

export interface uploadAvatarRequest extends Request {
    token: string;
    user: {
        _id: string;
        email: string;
        diskSpace: number;
        usedSpace: number;
        files: ObjectId[];
    },
    files: {
        file: any
    }
};

export interface deleteAvatarRequest extends Request {
    token: string;
    user: {
        _id: string;
        email: string;
        diskSpace: number;
        usedSpace: number;
        files: ObjectId[];
    }
}