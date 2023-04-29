import { Router } from "express";
import UserController from "../controllers/userController";

const userController = new UserController;
const router = Router();

router.post('/registration', userController.createUser);
router.post('/login', userController.loginUser);

export default router;