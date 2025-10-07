import { generateToken } from "@/app/lib/jwt";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest){
    try{
        const body = await req.json();
        const {email, password} = body;
        if(!email || !password){
            return NextResponse.json(
                {success: false, message: "Email and password required"},
                {status: 400}
            );
        }
        await connectDB();
        const user = await User.findOne({email});
        if(!user){
            return NextResponse.json(
                {success: false, message: "Invalid Credentials"},
                {status: 401}
            );
        }
        const isPasswordValid =await bcrypt.compare(password, user.passwordHash);
        if(!isPasswordValid){
            return NextResponse.json(
                {success: false, message: "Invalid Credentials"},
                {status: 401}
            );
        }
        if(user.twoFactorEnabled){
            const tempToken = generateToken(user._id.toString(), email);
            const response = NextResponse.json(
                {
                    success: true,
                    message: "2FA required",
                    require2FA: true,
                    user: {
                        id: user._id.toString(),
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        twoFactorEnabled: user.twoFactorEnabled,
                    },
                },
                {status: 200}
            );
            response.cookies.set('token', tempToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 7*24*60*60,
            });
            return response;
        }
        const token = generateToken(user._id.toString(), email);
        const response = NextResponse.json(
            {
                success: true,
                message: "Login Successful",
                token,
                user: {
                    id: user._id.toString(),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    twoFactorEnabled: user.twoFactorEnabled,
                },
            },{status: 200}
        )
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 7*24*60*60,
        });
        return response;
    }catch(error){
        let message = "Signin failed";
        console.log("Signin error: ", error);
        if(error instanceof Error){
            message = error.message;
        }
        return NextResponse.json(
            {successA: false, message, error: message},
            {status: 500}
        )
    }
}