import { verifyToken } from "@/app/lib/jwt";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest){
    try{
        const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
        if(!token){
            return NextResponse.json(
                {success: false, message: "No active session found"},
                {status: 400},
            );
        }
        const decoded = verifyToken(token);
        if(!decoded){
            return NextResponse.json(
                {success: false, message: "Invalid session"},
                {status: 401},
            );
        }
        const response = NextResponse.json(
            {
                success: true,
                message: "Logged out successfully",
            },
            {
                status: 200
            }
        );
        response.cookies.set('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 0,
        });
        return response;
    }catch(error: unknown){
        let message = "Failed to logout";
        if(error instanceof Error){
            message = error.message;
        }
        return NextResponse.json(
            {success: false, message, error: message},
            {status: 500}
        );
    }
}