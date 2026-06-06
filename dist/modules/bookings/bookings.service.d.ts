import { PrismaService } from '../../prisma/prisma.service';
import { CheckoutBookingDto } from './dto/checkout-booking.dto';
export declare class BookingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    checkout(userId: string, dto: CheckoutBookingDto): Promise<{
        success: boolean;
        booking: {
            id: string;
            tripId: string;
            userId: string;
            people: number;
            totalPrice: number;
            date: string | null;
            time: string | null;
            status: import(".prisma/client").$Enums.bookings_status;
            createdAt: Date;
            trip: {
                id: string;
                title: string;
                destinationId: string;
                destinationName: string;
            } | null;
        };
        payment: {
            id: string;
            bookingId: string;
            amount: number;
            method: import(".prisma/client").$Enums.payments_method;
            status: import(".prisma/client").$Enums.payments_status;
            providerTxnId: string | null;
            paidAt: Date | null;
            createdAt: Date;
        };
    }>;
    private mapBooking;
    private mapPayment;
}
