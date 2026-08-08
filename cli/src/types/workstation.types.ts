export interface ManagerWorkstation {
    id: number;
    name: string;
    description: string | null;
    equipment: string | null;
    dailyPriceCents: number;
    openAvailabilityCount: number;
    shopId: number;
    createdAt: string;
    updatedAt: string;
}

export interface ManagerWorkstationsResponse {
    data: ManagerWorkstation[];
    meta: {
        page: number;
        limit: number;
        total: number;
    };
}

export interface PublicWorkstation {
    id: number;
    name: string;
    description: string | null;
    equipment: string | null;
    dailyPriceCents: number;
    shop: {
        id: number;
        name: string;
        description: string | null;
        address: string;
        postalCode: string;
        city: string;
    };
    availabilities: {
        id: number;
        availableOn: string;
        status: "open";
    }[];
}

export interface PublicWorkstationsResponse {
    data: PublicWorkstation[];
    meta: {
        page: number;
        limit: number;
        total: number;
    };
}
