export type UserRole = "TATTOO_ARTIST" | "SHOP_MANAGER";

export interface LoginResponse {
    data: {
        accessToken: {
            token: string;
        };
        user: {
            id: number;
            displayName: string;
            email: string;
            role: UserRole;
        };
    };
}

export type RegisterResponse = LoginResponse;
