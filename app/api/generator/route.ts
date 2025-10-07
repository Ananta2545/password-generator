import { NextRequest, NextResponse } from "next/server";
import { generatePassword, validatePasswordOptions, calculatePasswordStrength, type PasswordOptions } from "@/app/lib/passwordGenerator";

/**
 * POST /api/generator
 * Generate a secure random password
 * 
 * Body: {
 *   length: number,
 *   includeUppercase: boolean,
 *   includeLowercase: boolean,
 *   includeNumbers: boolean,
 *   includeSymbols: boolean,
 *   excludeAmbiguous: boolean
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const options: PasswordOptions = {
      length: body.length || 16,
      includeUppercase: body.includeUppercase ?? true,
      includeLowercase: body.includeLowercase ?? true,
      includeNumbers: body.includeNumbers ?? true,
      includeSymbols: body.includeSymbols ?? true,
      excludeAmbiguous: body.excludeAmbiguous ?? false,
    };

    // Validate options
    const validation = validatePasswordOptions(options);
    
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    // Generate password
    const password = generatePassword(options);
    
    // Calculate strength
    const strength = calculatePasswordStrength(password);

    return NextResponse.json({
      success: true,
      password,
      strength,
      options,
    }, { status: 200 });

  } catch (error) {
    console.error("Generate password error:", error);
    
    let message = "Failed to generate password";
    if (error instanceof Error) {
      message = error.message;
    }
    
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}