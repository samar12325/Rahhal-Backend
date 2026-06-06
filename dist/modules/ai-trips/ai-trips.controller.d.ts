import { AiTripsService } from './ai-trips.service';
import { ChatAiTripDto } from './dto/chat-ai-trip.dto';
import { GenerateAiTripDto } from './dto/generate-ai-trip.dto';
type AuthenticatedRequest = {
    user: {
        userId: string;
    };
};
export declare class AiTripsController {
    private readonly service;
    constructor(service: AiTripsService);
    list(req: AuthenticatedRequest): Promise<{
        items: {
            id: string;
            mode: "assistant" | "planner";
            title: string;
            city: string;
            days: number;
            createdAt: Date;
            updatedAt: Date;
            lastMessageAt: Date;
            lastMessagePreview: string;
        }[];
    }>;
    generate(req: AuthenticatedRequest, dto: GenerateAiTripDto): Promise<{
        id: string;
        mode: "assistant" | "planner";
        title: string;
        locale: string;
        createdAt: Date;
        updatedAt: Date;
        form: {
            city: string;
            days: number;
            minBudget: string;
            maxBudget: string;
            people: number;
            style: string;
            prefs: import("@prisma/client/runtime/library").JsonArray;
            notes: string;
        };
        plan: {
            city: string;
            days: number;
            budgetLabel: string;
            tripTitle: string;
            overview: string;
            estimatedTotal: number;
            styleLabel: string;
            audienceLabel: string;
            highlights: string[];
            tips: string[];
            daysPlan: {
                day: number;
                title: string;
                subtitle?: string;
                estimatedTotal?: number;
                items: {
                    time: string;
                    name: string;
                    estimatedCost: number;
                    note: string;
                    tag?: string;
                }[];
            }[];
        };
        messages: {
            id: string;
            role: import(".prisma/client").$Enums.ai_trip_message_role;
            text: string;
            createdAt: Date;
        }[];
    }>;
    startAssistantSession(req: AuthenticatedRequest, dto: ChatAiTripDto): Promise<{
        id: string;
        mode: "assistant" | "planner";
        title: string;
        locale: string;
        createdAt: Date;
        updatedAt: Date;
        form: {
            city: string;
            days: number;
            minBudget: string;
            maxBudget: string;
            people: number;
            style: string;
            prefs: import("@prisma/client/runtime/library").JsonArray;
            notes: string;
        };
        plan: {
            city: string;
            days: number;
            budgetLabel: string;
            tripTitle: string;
            overview: string;
            estimatedTotal: number;
            styleLabel: string;
            audienceLabel: string;
            highlights: string[];
            tips: string[];
            daysPlan: {
                day: number;
                title: string;
                subtitle?: string;
                estimatedTotal?: number;
                items: {
                    time: string;
                    name: string;
                    estimatedCost: number;
                    note: string;
                    tag?: string;
                }[];
            }[];
        };
        messages: {
            id: string;
            role: import(".prisma/client").$Enums.ai_trip_message_role;
            text: string;
            createdAt: Date;
        }[];
    }>;
    chat(req: AuthenticatedRequest, id: string, dto: ChatAiTripDto): Promise<{
        reply: string;
        patchedPlan: {
            city: string;
            days: number;
            budgetLabel: string;
            tripTitle: string;
            overview: string;
            estimatedTotal: number;
            styleLabel: string;
            audienceLabel: string;
            highlights: string[];
            tips: string[];
            daysPlan: {
                day: number;
                title: string;
                subtitle?: string;
                estimatedTotal?: number;
                items: {
                    time: string;
                    name: string;
                    estimatedCost: number;
                    note: string;
                    tag?: string;
                }[];
            }[];
        };
        mode: string;
    }>;
    getById(req: AuthenticatedRequest, id: string): Promise<{
        id: string;
        mode: "assistant" | "planner";
        title: string;
        locale: string;
        createdAt: Date;
        updatedAt: Date;
        form: {
            city: string;
            days: number;
            minBudget: string;
            maxBudget: string;
            people: number;
            style: string;
            prefs: import("@prisma/client/runtime/library").JsonArray;
            notes: string;
        };
        plan: {
            city: string;
            days: number;
            budgetLabel: string;
            tripTitle: string;
            overview: string;
            estimatedTotal: number;
            styleLabel: string;
            audienceLabel: string;
            highlights: string[];
            tips: string[];
            daysPlan: {
                day: number;
                title: string;
                subtitle?: string;
                estimatedTotal?: number;
                items: {
                    time: string;
                    name: string;
                    estimatedCost: number;
                    note: string;
                    tag?: string;
                }[];
            }[];
        };
        messages: {
            id: string;
            role: import(".prisma/client").$Enums.ai_trip_message_role;
            text: string;
            createdAt: Date;
        }[];
    }>;
}
export {};
