import express, { Application } from "express";
import mongoose from "mongoose";
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";

import fileUpload from "express-fileupload";

import corsMiddleware from "./middleware/cors.middleware";

import authRouter from './routes/auth.routes';
import fileRouter from './routes/file.routes';

const app: Application = express();
dotenv.config();
const PORT = process.env.serverPort;

app.use(fileUpload({}));
app.use(corsMiddleware);
app.use(express.json());
app.use(express.static('static'));
app.use(cookieParser());

app.use(authRouter);
app.use(fileRouter);

const start = async () => {
    try {
        await mongoose.connect(process.env.dbUrl);
        app.listen(PORT, () => {
            console.log('Server started on port ', PORT);
        })
    } catch (err) {
        console.error(err)
    }
};

start();

export default app;