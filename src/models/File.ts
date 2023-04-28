import { model, Schema, ObjectId } from "mongoose";

interface FileInterface {
    name: string;
    type: string;
    accessLink: string;
    size: number;
    path: string;
    user: ObjectId;
    parent: ObjectId;
    children: ObjectId[];
}

const File = new Schema<FileInterface>({
    name: { type: String, required: true },
    type: { type: String, required: true },
    accessLink: { type: String },
    size: { type: Number, default: 0 },
    path: { type: String, default: '' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    parent: { type: Schema.Types.ObjectId, ref: 'File'},
    children: [{ type: Schema.Types.ObjectId, ref: 'File' }]
});

export = model<FileInterface>('FileModel', File)