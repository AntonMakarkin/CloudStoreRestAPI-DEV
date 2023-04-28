import { Request, Response } from "express";
import { ObjectId } from "mongoose";
import fs from "fs";
import FileService from "../services/fileService";
import User from '../models/User';
import FileModel from '../models/File';
import { FileInterface } from "../types/fileTypes";

import { searchFileRequest } from "../types/fileTypes";
import { uploadAvatarRequest, deleteAvatarRequest } from "../types/fileTypes";

import * as uuid from 'uuid';


type fileReqBody = {
    name: string;
    type: string;
    parent: string;
};

interface RequestAuthMiddleware extends Request {
    token: string;
    user: {
        _id: string;
        email: string;
        diskSpace: number;
        usedSpace: number;
        files: ObjectId[];
    }
};

class FileController {
    async createDir(req: RequestAuthMiddleware, res: Response) {
        try {
            const { name, type, parent }:fileReqBody = req.body;
            const file = new FileModel({ name, type, parent, user: req.user._id });
            const parentFile = await FileModel.findOne({ _id: parent });

            const fileService = new FileService;

            if (!parentFile) {
                file.path = name;
                await fileService.createDir(file);
            } else {
                file.path = `${parentFile.path}\\${file.name}`;
                await fileService.createDir(file);
                parentFile.children.push(file.id);
                await parentFile.save();
            }
            await file.save();
            return res.json(file);

        } catch (err) {
            console.log(err);
            return res.status(400).json(err)
        }
    };

    async fetchFiles(req: RequestAuthMiddleware, res: Response) {
        try {
            const { sort } = req.query;
            let files;

            switch (sort) {
                case 'name':
                    files = await FileModel.find({ user: req.user._id, parent: req.query.parent }).sort({ name: 1 });
                    break;
                case 'type':
                    files = await FileModel.find({ user: req.user._id, parent: req.query.parent }).sort({ type: 1 });
                    break;
                case 'date':
                    files = await FileModel.find({ user: req.user._id, parent: req.query.parent }).sort({ date: 1 });
                    break;
                default:
                    files = await FileModel.find({ user: req.user._id, parent: req.query.parent });
                    break;
            }

            return res.json({files});
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: 'Can not get files' });
        }
    };
    
    async uploadFile(req: RequestAuthMiddleware, res: Response) {
        try {
            const file:any = req.files.file;

            const parent = await FileModel.findOne({ user: req.user._id,  _id: req.body.parent });
            const user = await User.findOne({ _id: req.user._id });

            if (user.usedSpace + file?.size > user.diskSpace) {
                return res.status(400).json({ message: 'There is no space on the disk' })
            }

            user.usedSpace = user.usedSpace + file.size;

            let path;

            if (parent) {
                path = `${process.env.filePath}\\${user._id}\\${parent.path}\\${file.name}`
            } else {
                path = `${process.env.filePath}\\${user._id}\\${file.name}`
            }

            if (fs.existsSync(path)) {
                return res.status(400).json({ message: 'File already exists' })
            }

            file.mv(path); //move file on path

            const type = file.name.split('.').pop(); //to get file extension (there can be many dots in name)
            let filePath = file.name;

            if (parent) {
                filePath = parent.path + '\\' + file.name
            }

            const dbFile = new FileModel({
                name: file.name,
                type,
                size: file.size,
                path: filePath,
                parent: parent?._id,
                user: user._id
            });

            await dbFile.save();
            await user.save();

            res.json(dbFile);

        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: 'Upload error' });
        }
    };

    async downloadFile(req: RequestAuthMiddleware, res: Response) {
        try {
            const file = await FileModel.findOne({ _id: req.query.id, user: req.user._id });
            const fileService = new FileService();
            const path = fileService.getPath(file);

            if (fs.existsSync(path)) {
                return res.download(path, file.name)
            }

            return res.status(404).json({ message: 'File not found' });

        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Download error' });
        }
    };

    async deleteFile(req: RequestAuthMiddleware, res: Response) {
        try {
            const file = await FileModel.findOne({ _id: req.query.id, user: req.user._id });

            if (!file) {
                return res.status(404).json({ message: 'File not found' });
            }

            const fileService = new FileService;
            fileService.deleteFile(file);
            await file.deleteOne();
            return res.json({ message: 'File was deleted' });
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: 'Dir is not empty' });
        }
    };

    async searchFile(req: searchFileRequest, res: Response) {
        try {
            const searchName = req.query.search;
            let files = await FileModel.find({ user: req.user._id });
            files = files.filter(file => file.name.includes(searchName));
            return res.json(files);
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: 'Search Error' });
        }
    }

    async uploadAvatar(req: uploadAvatarRequest, res: Response) {
        try {
            const file = req.files.file;
            const fileType = file.name.split('.').pop();
            console.log(fileType);

            if (fileType !== 'jpeg' && fileType !== 'png' && fileType !== 'jpg') {
                return res.status(400).json({ message: 'Incorrect file type' });
            }

            /*const arrayOfAllowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];

            if (arrayOfAllowedFileTypes.includes(file.mimetype)) {
                return res.status(400).json({ message: 'Incorrect file type' });
            }*/

            const user = await User.findById(req.user._id);

            const avatarName = `${uuid.v4()}.jpg`;
            file.mv(`${process.env.staticPath}\\${avatarName}`);
            user.avatar = avatarName;
            await user.save();
            return res.json(user);
        } catch (err) {
            console.log(err);
            return res.status(400).json({ message: 'Upload avatar error' });
        }
    };

    async deleteAvatar(req: deleteAvatarRequest, res: Response) {
        try {
            const user = await User.findById(req.user._id);
            fs.unlinkSync(`${process.env.staticPath}\\${user.avatar}`);
            user.avatar = null;
            await user.save();
            return res.json(user);
        } catch (err) {
            console.log(err);
            return res.status(400).json({ message: 'Delete avatar error' });
        }
    }
};

export default FileController;
