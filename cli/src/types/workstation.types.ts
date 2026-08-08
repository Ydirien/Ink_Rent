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
