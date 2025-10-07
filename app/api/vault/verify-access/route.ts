import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/jwt";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/user";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";

export async function POST(req: NextRequest) {
  try {
    // Get JWT token from cookies
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { password, twoFactorCode } = await req.json();

    await connectDB();
    const user = await User.findById(payload.userId);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // If 2FA is enabled, verify 2FA code
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return NextResponse.json(
          { message: "2FA code required", requires2FA: true },
          { status: 400 }
        );
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: twoFactorCode,
        window: 2,
      });

      if (!verified) {
        return NextResponse.json(
          { message: "Invalid 2FA code" },
          { status: 401 }
        );
      }

      return NextResponse.json({ 
        message: "Access verified with 2FA",
        verified: true 
      });
    }

    // Otherwise, verify password
    if (!password) {
      return NextResponse.json(
        { message: "Password required", requires2FA: false },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      message: "Access verified with password",
      verified: true 
    });

  } catch (error) {
    console.error("Vault access verification error:", error);
    return NextResponse.json(
      { message: "Verification failed" },
      { status: 500 }
    );
  }
}
