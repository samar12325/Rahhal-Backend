export declare enum CheckoutPaymentMethod {
    card = "card",
    applepay = "applepay"
}
export declare class CheckoutBookingDto {
    tripId: number;
    destinationId: number;
    date: string;
    time: string;
    people: number;
    paymentMethod: CheckoutPaymentMethod;
    amount?: number;
}
