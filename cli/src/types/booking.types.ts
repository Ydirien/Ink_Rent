export type BookingStatus =
    | "PENDING"
    | "CONFIRMED"
    | "REJECTED"
    | "CANCELLED";

export type BookingDecisionStatus = "CONFIRMED" | "REJECTED";

export interface MyBooking {
    id: number;
    message: string | null;
    status: BookingStatus;
    createdAt: string;
    updatedAt: string;
    availability: {
        id: number;
        availableOn: string;
        status: "OPEN" | "PENDING" | "BOOKED";
        workstation: {
            id: number;
            name: string;
            description: string | null;
            equipment: string | null;
            dailyPriceCents: number;
            shop: {
                id: number;
                name: string;
                address: string;
                postalCode: string;
                city: string;
            };
        };
    };
}

export interface MyBookingsResponse {
    data: MyBooking[];
    meta: {
        page: number;
        limit: number;
        total: number;
    };
}

export interface ManagerBooking {
    id: number;
    message: string | null;
    status: BookingStatus;
    createdAt: string;
    updatedAt: string;
    tattooArtist: {
        user: {
            id: number;
            displayName: string;
        };
    };
    availability: {
        id: number;
        availableOn: string;
        status: "OPEN" | "PENDING" | "BOOKED";
        workstation: {
            id: number;
            name: string;
            dailyPriceCents: number;
        };
    };
}

export interface ManagerBookingsResponse {
    data: ManagerBooking[];
    meta: {
        page: number;
        limit: number;
        total: number;
    };
}
