import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest){
    try{
        await connectDB();

        const userCount = await User.countDocuments();

        return NextResponse.json(
            {
                success: true,
                message: "Database connection successful!",
                data: {
                    status: "connected",
                    userCount,
                    database: 'Mongodb',
                }
            },
            {status: 200}
        )

    }catch(error: unknown){
        console.error("Database connection error: ", error);
        let message = "Database connection failed";

        if(error instanceof Error){
            message = error.message;
        }

        return NextResponse.json(
        {
            success: false,
            message,
            error: message,
        }, {status: 500})
    }
}