import { Model, Schema, model } from "mongoose";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface User {
    email: string;
    password: string;
    diskSpace: number;
    usedSpace: number;
    avatar: string;
    files: string;
};

interface findByCredentialsResponse {
    _id: string;
    email: string;
    password: string;
    diskSpace: number;
    usedSpace: number;
    avatar: string;
    files: string[];
} 

interface UserModel extends Model<User> {
    generateAuthToken: () => Promise<string>;
    findByCredentials: (email: string, password: string) => Promise<findByCredentialsResponse>;
}

const UserSchema = new Schema<User, UserModel>({
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true },
    diskSpace: { type: Number, default: 1024**3*10},
    usedSpace: { type: Number, default: 0},
    avatar: { type: String },
    files: [{ type: Schema.Types.ObjectId , ref: 'File' }]
});

UserSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
};

/*UserSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_ACCESS_SECRET_KEY);

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
};*/

/*UserSchema.statics.findByCredentials = async (email: string, password: string) => {
    const user = await User.findOne({ email });
    console.log(user);

    if (!user) {
        throw new Error('Incorrect login or password');
    }

    const isMatch:boolean = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Incorrect login or password');
    };

    return user;
};*/

//Hash the plain text password before saving
UserSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next(); //middleware function is finished
});

const User = model<User,UserModel>('User', UserSchema);

export default User;