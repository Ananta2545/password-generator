import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/user";
import { NextRequest, NextResponse } from "next/server";
import speakeasy from 'speakeasy';
import { verifyToken} from "@/app/lib/jwt";

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

        // ✅ Read JWT token from cookies (set during signin)
        const jwtToken = req.cookies.get('token')?.value;
        
        if (!jwtToken) {
            return NextResponse.json(
                { success: false, message: "Authentication session not found. Please sign in again." },
                { status: 401 }
            );
        }

        // Verify JWT token from cookies
        const decoded = verifyToken(jwtToken);
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

        // ✅ 2FA verified successfully - the JWT token is already in cookies
        // No need to generate a new token, just return success
        const response = NextResponse.json(
            {
                success: true,
                message: "Login successful",
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

        // ✅ Cookie is already set from signin endpoint, no need to set again
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