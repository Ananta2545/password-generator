import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/user";
import { NextRequest, NextResponse } from "next/server";
import speakeasy from 'speakeasy';
import { verifyToken } from "@/app/lib/jwt";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token: twoFactorToken } = body;

        // Validate 2FA token
        if (!twoFactorToken) {
            return NextResponse.json(
                { success: false, message: "2FA token required" },
                { status: 400 }
            );
        }

        // Get JWT token from Authorization header
        const authHeader = req.headers.get('authorization');
        const jwtToken = authHeader?.replace('Bearer ', '');

        if (!jwtToken) {
            return NextResponse.json(
                { success: false, message: "Unauthorized - No token provided" },
                { status: 401 }
            );
        }

        // Verify JWT token
        const decoded = verifyToken(jwtToken);
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: "Invalid or expired token" },
                { status: 401 }
            );
        }

        await connectDB();

        // Find user by ID
        const user = await User.findById(decoded.userId);

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        // Check if 2FA secret exists
        if (!user.twoFactorSecret) {
            return NextResponse.json(
                { success: false, message: "2FA not initiated. Please call /api/auth/enable-2fa first" },
                { status: 400 }
            );
        }

        // Check if 2FA already enabled
        if (user.twoFactorEnabled) {
            return NextResponse.json(
                { success: false, message: "2FA is already enabled for this account" },
                { status: 400 }
            );
        }

        // Verify 2FA token with speakeasy
        const isValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: twoFactorToken,
            window: 2, // Allow 2 time windows (60 seconds tolerance)
        });

        if (!isValid) {
            return NextResponse.json(
                { success: false, message: "Invalid 2FA token. Please try again with a fresh code" },
                { status: 401 }
            );
        }

        // ✅ Enable 2FA after successful verification
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