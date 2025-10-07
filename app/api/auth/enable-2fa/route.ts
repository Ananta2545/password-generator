import { verifyToken } from "@/app/lib/jwt";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/user";
import { NextRequest, NextResponse } from "next/server";
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
export async function POST(req: NextRequest){
    try{
        const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
        if(!token){
            return NextResponse.json(
                {success: false, message: "Unauthorized"},{status: 401}
            );
        }
        const decoded = verifyToken(token);
        if(!decoded){
            return NextResponse.json(
                {success: false, message: "Invalid token"},
                {status: 401}
            );
        }
        await connectDB();
        const user = await User.findById(decoded.userId);
        if(!user){
            return NextResponse.json(
                {success: false, message: "User not found"},
                {status: 400}
            );
        }
        if(user.twoFactorEnabled){
            return NextResponse.json(
                {success: false, message: "2FA is already enabled"},
                {status: 400}
            );
        }
        const twoFactorSecret = speakeasy.generateSecret({
            name: `PasswordVault (${user.email})`,
        });
        const qrCode = await QRCode.toDataURL(twoFactorSecret.otpauth_url || '');
        user.twoFactorSecret = twoFactorSecret.base32;
        await user.save();
        return NextResponse.json({
            success: true,
            message: "2FA setup initiated",
            qrCode,
            secret: twoFactorSecret.base32,
        }, {status: 200});
    }catch(error: unknown){
        const message = "Enable 2fa failed";
        console.log("Enable 2fa error", error);
        return NextResponse.json({
            success: false, message, error: message
        }, {status: 500})
    }
}