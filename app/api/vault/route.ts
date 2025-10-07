import { verifyToken } from "@/app/lib/jwt";
import { connectDB } from "@/app/lib/mongodb";
import VaultItem from "@/app/models/vaultItem";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/vault
 * Get all vault items for authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    await connectDB();

    // Get all items for this user, sorted by newest first
    const items = await VaultItem.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .select('-__v') // Exclude version key
      .lean();

    return NextResponse.json({
      success: true,
      count: items.length,
      items,
    }, { status: 200 });

  } catch (error) {
    console.error("Get vault items error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch vault items" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vault
 * Create a new vault item
 * 
 * Body: {
 *   encryptedData: string,  // Encrypted JSON string
 *   tags?: string[]         // Optional tags
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { encryptedData, tags } = body;

    // Validate required fields
    if (!encryptedData || typeof encryptedData !== 'string') {
      return NextResponse.json(
        { success: false, message: "Encrypted data is required" },
        { status: 400 }
      );
    }

    // Validate tags if provided
    if (tags && !Array.isArray(tags)) {
      return NextResponse.json(
        { success: false, message: "Tags must be an array" },
        { status: 400 }
      );
    }

    await connectDB();

    // Create new vault item
    const newItem = await VaultItem.create({
      userId: decoded.userId,
      encryptedData,
      tags: tags || [],
      lastModified: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Vault item created successfully",
      item: {
        id: newItem._id.toString(),
        encryptedData: newItem.encryptedData,
        tags: newItem.tags,
        createdAt: newItem.createdAt,
        lastModified: newItem.lastModified,
      },
    }, { status: 201 });

  } catch (error) {
    console.error("Create vault item error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create vault item" },
      { status: 500 }
    );
  }
}