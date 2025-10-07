import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/user";
import { NextRequest, NextResponse } from "next/server";
import speakeasy from 'speakeasy';
import { verifyToken } from "@/app/lib/jwt";
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token: twoFactorToken } = body;
        if (!twoFactorToken) {
            return NextResponse.json(
                { success: false, message: "2FA token required" },
                { status: 400 }
            );
        }
        const jwtToken = req.cookies.get('token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
        console.log('🔍 JWT Token from cookies:', req.cookies.get('token')?.value ? 'Found' : 'Not found');
        console.log('🔍 JWT Token from header:', req.headers.get('authorization') ? 'Found' : 'Not found');
        if (!jwtToken) {
            return NextResponse.json(
                { success: false, message: "Unauthorized - No token provided" },
                { status: 401 }
            );
        }
        const decoded = verifyToken(jwtToken);
        console.log('🔍 Decoded token:', decoded);
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: "Invalid or expired token" },
                { status: 401 }
            );
        }
        await connectDB();
        const user = await User.findById(decoded.userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }
        if (!user.twoFactorSecret) {
            return NextResponse.json(
                { success: false, message: "2FA not initiated. Please call /api/auth/enable-2fa first" },
                { status: 400 }
            );
        }
        if (user.twoFactorEnabled) {
            return NextResponse.json(
                { success: false, message: "2FA is already enabled for this account" },
                { status: 400 }
            );
        }
        const isValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: twoFactorToken,
            window: 2,
        });
        if (!isValid) {
            return NextResponse.json(
                { success: false, message: "Invalid 2FA token. Please try again with a fresh code" },
                { status: 401 }
            );
        }
        user.twoFactorEnabled = true;
        await user.save();
        return NextResponse.json({
            success: true,
            message: "2FA enabled successfully! Your account is now secured with two-factor authentication",
            user: {
                id: user._id.toString(),
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                twoFactorEnabled: user.twoFactorEnabled,
            },
        }, { status: 200 });
    } catch (error: unknown) {
        let message = "Failed to verify and enable 2FA";
        console.error("Verify enable 2FA error:", error);
        if (error instanceof Error) {
            message = error.message;
        }
        return NextResponse.json(
            { success: false, message, error: message },
            { status: 500 }
        );
    }
}