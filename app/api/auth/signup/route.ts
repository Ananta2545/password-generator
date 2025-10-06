import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/user";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcryptjs'
import { generateToken } from "@/app/lib/jwt";

export async function POST(req: NextRequest){
    try{
        const body = await req.json();
        const {firstName, lastName, email, password} = body;

        if(!firstName || !lastName || !email || !password){
            return NextResponse.json(
                {success: false, message: "All fields required"},
                {status: 400}
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return NextResponse.json(
                {success: false, message: "Invalid email format"},
                {status: 400}
            );
        }

        if(password.length < 8){
            return NextResponse.json(
                {success: false, message: "password must be at least 8 charecters"},{status: 400}
            );
        }

        await connectDB();

        const existingUser = await User.findOne({
            $or: [{email}] 
        });

        if(existingUser){
            return NextResponse.json(
                {success: false, message: "User already exists with this email"}, {status: 400}
            );
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // create new user
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            passwordHash,
            twoFactorSecret: '',
            twoFactorEnabled: false,
        });

        // generate qr code for 2fa setup
        // const qrcode = await QRCode.toDataURL(twoFactorSecret.otpauth_url || '');

        // generate jwtToken
        const token = generateToken(newUser._id.toString(), email);

        const response = NextResponse.json({
            success: true,
            message: "User created successfully",
            token,
            user: {
                id: newUser._id.toString(),
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                twoFactorEnabled: newUser.twoFactorEnabled,
            },
        }, {status: 201})

        response.cookies.set('token',token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        })

        return response;

    }catch(error: unknown){
        let message = "Signup failed";
        console.log("Signup error", error);
        return NextResponse.json({
            success: false, message, error: message
        }, {status: 500})
    }
}