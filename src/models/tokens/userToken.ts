import { Schema, Model, model, Types } from "mongoose";
import jwt from "jsonwebtoken";

interface UserToken {
    user: Schema.Types.ObjectId;
    refreshToken: string;
};

interface generateTokensResponse {
    accessToken: string;
    refreshToken: string;
}

interface generateTokensPayload {
    _id: string;
    email: string;
}

interface UserTokenModel extends Model<UserToken> {
    generateTokens: (payload: generateTokensPayload) => Promise<generateTokensResponse>;
    saveRefreshToken: (userId: any, refreshToken: string) => Promise<string>;
    removeRefreshToken: (refreshToken: string) => Promise<string>;
    findRefreshToken: (refreshToken: string) => Promise<string>;
}

const tokenUserSchema = new Schema<UserToken, UserTokenModel>({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    refreshToken: { type: String, required: true }
});

tokenUserSchema.statics.generateTokens = async function (payload: generateTokensPayload) {
    const accessToken:string = jwt.sign(payload, process.env.JWT_ACCESS_SECRET_KEY, {expiresIn: '20m'});
    const refreshToken:string = jwt.sign(payload, process.env.JWT_REFRESH_SECRET_KEY, {expiresIn: '30d'});

    return {
        accessToken,
        refreshToken
    }
};

tokenUserSchema.statics.saveRefreshToken = async function (userId: any, refreshToken: string) {
    const tokenData = await tokenUser.findOne({ user: userId });

    if (tokenData) {
        tokenData.refreshToken = refreshToken;
        return tokenData.save()
    }

    const token = await tokenUser.create({ user: userId, refreshToken });

    return token;
};

tokenUserSchema.statics.removeRefreshToken = async function (refreshToken: string) {
    const tokenData = await tokenUser.deleteOne({ refreshToken });
    return tokenData;
}

tokenUserSchema.statics.findRefreshToken = async function (refreshToken: string) {
    const tokenData = await tokenUser.findOne({ refreshToken });
    return tokenData;
}

const tokenUser = model<UserToken, UserTokenModel>('tokenUser', tokenUserSchema);

export default tokenUser;