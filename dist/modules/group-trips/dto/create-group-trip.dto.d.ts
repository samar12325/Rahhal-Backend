export declare class CreateGroupTripDto {
    title: string;
    destination_id: number;
    description?: string;
    start_date: string;
    end_date?: string;
    duration_days?: number;
    price_per_person?: number;
    max_participants?: number;
    required_participants: number;
    join_deadline?: string;
    notes?: string;
    image_url?: string;
}
