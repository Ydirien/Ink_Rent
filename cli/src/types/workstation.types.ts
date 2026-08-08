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

export type AvailabilityStatus = "open" | "pending" | "booked";

export interface ManagerAvailability {
    id: number;
    availableOn: string;
    status: AvailabilityStatus;
    workstationId: number;
    createdAt: string;
    updatedAt: string;
}

export interface ManagerWorkstationDetail {
    id: number;
    name: string;
    description: string | null;
    equipment: string | null;
    dailyPriceCents: number;
    shopId: number;
    createdAt: string;
    updatedAt: string;
    availabilities: ManagerAvailability[];
}

export interface ManagerWorkstationResponse {
    data: ManagerWorkstationDetail;
}

export interface AvailabilityResponse {
    data: ManagerAvailability;
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

export interface PublicWorkstationResponse {
    data: PublicWorkstation;
}

export interface CreatedWorkstationResponse {
    data: {
        id: number;
    };
}

export interface WorkstationFormErrors {
    name?: string;
    description?: string;
    equipment?: string;
    dailyPrice?: string;
    form?: string;
}
