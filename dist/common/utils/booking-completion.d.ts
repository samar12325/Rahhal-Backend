type BookingCompletionInput = {
    scheduledDate?: Date | null;
    scheduledTime?: string | null;
    tripStartDate?: Date | null;
    tripEndDate?: Date | null;
    now?: Date;
};
export declare const isBookingCompletedByDate: ({ scheduledDate, scheduledTime, tripStartDate, tripEndDate, now, }: BookingCompletionInput) => boolean;
export {};
