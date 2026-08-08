export interface LoginResponse {
    data: {
        accessToken: {
            token: string;
        };
        user: {
            id: number;
            displayName: string;
            email: string;
            role: "TATTOO_ARTIST" | "SHOP_MANAGER";
        };
    };
}
