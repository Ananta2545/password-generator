import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/user";
import { NextRequest, NextResponse } from "next/server";
import speakeasy from 'speakeasy';
import { verifyToken, generateToken } from "@/app/lib/jwt";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token: twoFactorToken, tempToken } = body;

        if (!twoFactorToken || !tempToken) {
            return NextResponse.json(
                { success: false, message: "2FA token and temp token required" },
                { status: 400 }
            );
        }

        // Verify temporary JWT token
        const decoded = verifyToken(tempToken);
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: "Invalid or expired session" },
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
                { success: false, message: "2FA not set up" },
                { status: 400 }
            );
        }

        // Verify 2FA token
        const isValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: twoFactorToken,
            window: 2,
        });

        if (!isValid) {
            return NextResponse.json(
                { success: false, message: "Invalid 2FA token" },
                { status: 401 }
            );
        }

        // Generate final JWT token
        const jwtToken = generateToken(user._id.toString(), user.email);

        const response = NextResponse.json(
            {
                success: true,
                message: "Login successful",
                token: jwtToken,
                user: {
                    id: user._id.toString(),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    twoFactorEnabled: user.twoFactorEnabled,
                },
            },
            { status: 200 }
        );

        // Set cookie
        response.cookies.set('token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return response;

    } catch (error: unknown) {
        let message = "Failed to verify 2FA";
        console.log("Failed verifying 2FA:", error);
        
        if (error instanceof Error) {
            message = error.message;
        }
        
        return NextResponse.json(
            { success: false, message, error: message },
            { status: 500 }
        );
    }
}