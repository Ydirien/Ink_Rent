import type { UserRole } from "./auth.types.ts";

export interface CurrentUser {
    id: number;
    displayName: string;
    email: string;
    role: UserRole;
}

export interface CurrentUserResponse {
    data: CurrentUser;
}
