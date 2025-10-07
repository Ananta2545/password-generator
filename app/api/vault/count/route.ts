import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/jwt";
import { connectDB } from "@/app/lib/mongodb";
import VaultItem from "@/app/models/vaultItem";
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    await connectDB();
    const count = await VaultItem.countDocuments({ userId: payload.userId });
    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("Vault count error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get vault count" },
      { status: 500 }
    );
  }
}
