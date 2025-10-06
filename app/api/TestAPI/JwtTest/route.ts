import { generateToken, verifyToken } from "@/app/lib/jwt"
import { NextResponse } from "next/server";

export async function GET(){
    try{
        // simulate a user
        const fakeUser = {
            id: "12345",
            email: "test@example.com",
        }

        // generate a token
        const token = generateToken(fakeUser.id, fakeUser.email);

        // verify the token immediately
        const verified = verifyToken(token);

        return NextResponse.json({
            success: true,
            message: "JWT Test successfull",
            token,
            verified,
        })
    }catch(error: unknown){
        console.error("JWT TEST ERROR");
        return NextResponse.json({
            success: false, message: "JWT TEST FAILED", error
        }, {status: 500});
    }
}