export type BookingStatus =
    | "PENDING"
    | "CONFIRMED"
    | "REJECTED"
    | "CANCELLED";

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
