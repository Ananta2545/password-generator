import mongoose, { Model, Schema } from "mongoose";
type UserDocument = {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    twoFactorSecret: string;
    twoFactorEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}
const UserSchema = new Schema<UserDocument>(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        }, 
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        twoFactorSecret: {
            type: String,
            default: '',
        },
        twoFactorEnabled: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);
const User: Model<UserDocument> = mongoose.models.User || mongoose.model<UserDocument> ('User', UserSchema);
export default User;