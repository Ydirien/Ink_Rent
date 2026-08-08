export interface Shop {
    id: number;
    name: string;
    description: string | null;
    address: string;
    postalCode: string;
    city: string;
    managerId: number;
    createdAt: string;
    updatedAt: string;
}

export interface ShopResponse {
    data: Shop;
}

export interface ShopFormErrors {
    name?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    description?: string;
}
