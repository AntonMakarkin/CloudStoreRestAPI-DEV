import { Request, Response } from "express";
import FileService from "../services/fileService";
import User from '../models/User';
import File from '../models/File';
import tokenUser from '../models/tokens/userToken';
import * as bcrypt from "bcrypt";

import { reqBody } from "../types/userTypes";

class UserController {
    async createUser(req: Request, res: Response) {
        try {
            const { email, password }:reqBody = req.body;
            const candidate = await User.findOne({ email });

            if (candidate) {
                return res.status(400).json({ message: `User with email '${email}' already exists` })
            }

            const user = new User({ email, password });
            await user.save();

            const payload = { _id: user._id.toString(), email: user.email };
            const tokens = await tokenUser.generateTokens(payload);
            const refreshToken:string = tokens.refreshToken;

            await tokenUser.saveRefreshToken(user._id, refreshToken);

            const accessToken:string = tokens.accessToken;

            res.cookie('accessToken', accessToken, { maxAge: 1200000, httpOnly: true });
            res.cookie('refreshToken', refreshToken, { maxAge: 2592000000, httpOnly: true });

            const fileService = new FileService;

            await fileService.createDir(new File({ user: user._id, name: '' }));

            return res.json({ user, accessToken, message: `User was successfully created` });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server Error' });
        }
    };

    async loginUser(req: Request, res: Response) {
        try {
            const { email, password }:reqBody = req.body;
            const user = await User.findOne({ email });
        
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const isPassValid = bcrypt.compareSync(password, user.password);

            if (!isPassValid) {
                return res.status(400).json({ message: 'Invalid login or password' });
            }

            const payload = { _id: user._id.toString(), email: user.email };  
            const tokens = await tokenUser.generateTokens(payload);
            const refreshToken = tokens.refreshToken;

            await tokenUser.saveRefreshToken(user._id, refreshToken);

            const accessToken = tokens.accessToken;
            
            res.cookie('accessToken', accessToken, { maxAge: 1200000, httpOnly: true });
            res.cookie('refreshToken', refreshToken, { maxAge: 2592000000, httpOnly: true });
            
            return res.json({ user, accessToken });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error' });
        }
    }
};

export default UserController;