export const ROLES = ["TATTOO_ARTIST", "SHOP_MANAGER"] as const;

export type Role = (typeof ROLES)[number];