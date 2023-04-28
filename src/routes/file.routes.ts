import { Router, Request, Response } from 'express';
import authMiddleware from '../middleware/auth.middleware'
import FileController from '../controllers/fileController';

const fileController = new FileController;
const router = Router();

router.post('/files', authMiddleware, fileController.createDir);
router.get('/files', authMiddleware, fileController.fetchFiles);

router.post('/avatar', authMiddleware, fileController.uploadAvatar);
router.delete('/avatar', authMiddleware, fileController.deleteAvatar);

router.post('/files/upload', authMiddleware, fileController.uploadFile);
router.get('/files/search', authMiddleware, fileController.searchFile);
router.get('/files/download', authMiddleware, fileController.downloadFile);

router.delete('/', authMiddleware, fileController.deleteFile)

export default router;