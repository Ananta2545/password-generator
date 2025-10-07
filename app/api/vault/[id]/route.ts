import { verifyToken } from "@/app/lib/jwt";
import { connectDB } from "@/app/lib/mongodb";
import VaultItem from "@/app/models/vaultItem";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/vault/:id
 * Get a single vault item by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    await connectDB();

    // Find item and verify ownership
    const item = await VaultItem.findOne({
      _id: params.id,
      userId: decoded.userId,
    }).select('-__v').lean();

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Vault item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      item,
    }, { status: 200 });

  } catch (error) {
    console.error("Get vault item error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch vault item" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/vault/:id
 * Update a vault item
 * 
 * Body: {
 *   encryptedData?: string,
 *   tags?: string[]
 * }
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { encryptedData, tags } = body;

    // Validate at least one field is provided
    if (!encryptedData && !tags) {
      return NextResponse.json(
        { success: false, message: "At least one field must be provided" },
        { status: 400 }
      );
    }

    await connectDB();

    // Build update object
    const updateData: any = {
      lastModified: new Date(),
    };

    if (encryptedData) {
      updateData.encryptedData = encryptedData;
    }

    if (tags) {
      updateData.tags = tags;
    }

    // Update item and verify ownership
    const item = await VaultItem.findOneAndUpdate(
      { _id: params.id, userId: decoded.userId },
      updateData,
      { new: true, runValidators: true }
    ).select('-__v').lean();

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Vault item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Vault item updated successfully",
      item,
    }, { status: 200 });

  } catch (error) {
    console.error("Update vault item error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update vault item" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/vault/:id
 * Delete a vault item
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    await connectDB();

    // Delete item and verify ownership
    const item = await VaultItem.findOneAndDelete({
      _id: params.id,
      userId: decoded.userId,
    });

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Vault item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Vault item deleted successfully",
    }, { status: 200 });

  } catch (error) {
    console.error("Delete vault item error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete vault item" },
      { status: 500 }
    );
  }
}