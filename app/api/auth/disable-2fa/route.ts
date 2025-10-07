import { verifyToken } from "@/app/lib/jwt";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import speakeasy from 'speakeasy';
export async function POST(req: NextRequest){
    try{
        const body = await req.json();
        const {password, token: twoFactorToken} = body;
        if(!password || !twoFactorToken){
            return NextResponse.json(
                {success: false, message: "Password and 2FA token required"},
                {status: 400}
            );
        }
        const jwtToken = req.cookies.get('token')?.value;
        if(!jwtToken){
            return NextResponse.json(
                {success: false, message: "Unauthorized - No token provided"},
                {status: 401}
            );
        }
        const decoded = verifyToken(jwtToken);
        if(!decoded){
            return NextResponse.json(
                {success: false, message: "Invalid or expired token"},
                {status: 401}
            );
        }
        await connectDB();
        const user = await User.findById(decoded.userId);
        if(!user){
            return NextResponse.json(
                {success: false, message: "User not found"},
                {status: 404}
            );
        }
        if(!user.twoFactorEnabled){
            return NextResponse.json(
                {success: false, message: "2FA is not enabled for this account"},
                {status: 400}
            );
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if(!isPasswordValid){
            return NextResponse.json(
                {success: false, message: "Invalid password"},
                {status: 401}
            );
        }
        const isValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: twoFactorToken,
            window: 2,
        });
        if(!isValid){
            return NextResponse.json(
                {success: false, message: "Invalid 2FA token"},
                {status: 401}
            );
        }
        user.twoFactorEnabled = false;
        user.twoFactorSecret = '';
        await user.save();
        return NextResponse.json(
            {
                success: true,
                message: "2FA disabled successfully. Your account is no longer protected with two factor authentication",
                user: {
                    id: user._id.toString(),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    twoFactorEnabled: user.twoFactorEnabled,
                },
            }, {status: 200}
        );
    }catch(error: unknown){
        let message = "Failed to disable 2FA";
        console.error("Disable 2FA error:", error);
        if(error instanceof Error){
            message = error.message;
        }
        return NextResponse.json(
            {success: false, message, error: message}, {status: 500}
        );
    }
}