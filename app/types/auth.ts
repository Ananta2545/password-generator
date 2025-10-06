export type User = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    passwordHash: string;
    twoFactorSecret: string;
    twoFactorEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type SignupRequest = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export type SigninRequest = {
    email: string;
    password: string;
}

export type Enable2FAResponse = {
    qrCodeDataUrl: string;
    secret: string;
}

export type verify2FARequest = {
    userId: string;
    token: string;
    secret?: string;
}

export type AuthResponse = {
    success: boolean;
    message: string;
    token?: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        twoFactorEnabled: boolean;
    };
    qrCode?: string;
    require2FA?: boolean;

}