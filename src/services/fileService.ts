import fs from 'fs';
import { FileInterface } from '../types/fileTypes';

class FileService {
    createDir(file: any) {
        const filePath = `${process.env.filePath}\\${file.user}\\${file.path}`
        return new Promise((resolve, reject) => {
            try {
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath)
                    return resolve({ message: 'File was created' });
                } else {
                    return reject({ message: 'File already exists' });
                }
            } catch (err) {
                return reject({ message: 'File error' });
            }
        })
    };
    
    deleteFile(file: FileInterface) {
        const path = this.getPath(file);

        if (file.type == 'dir') {
            fs.rmdirSync(path);
        } else {
            fs.unlinkSync(path);
        }
    };

    getPath(file: FileInterface) {
        return `${process.env.filePath}\\${file.user}\\${file.path}`        
    }
};

export default FileService;