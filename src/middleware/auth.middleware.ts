import { Request, Response, NextFunction } from 'express';
import { Schema } from 'mongoose';
import User from '../models/User';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface RequestWithUser extends Request {
    token: string;
    user: any;
};

const auth = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
        return next();
    };

    try {
        const token = req.headers.authorization.replace('Bearer ', ''); //remove Bearer

        if (!token) {
            return res.status(401).json({ message: 'Authentication error' })
        }
        
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY);
        const user = await User.findOne({ _id: (<any>decoded)._id, email: (<any>decoded).email });

        if (!user) {
            return res.status(401).json({ message: 'Authentication error'});
        };

        req.token = token;
        req.user = user;
        next();

    } catch (err) {
        console.log(err);
        return res.status(401).json({ message: 'Please authenticate' })
    }
}

export default auth;