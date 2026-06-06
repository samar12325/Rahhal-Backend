import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatAiTripDto } from './dto/chat-ai-trip.dto';
import { GenerateAiTripDto } from './dto/generate-ai-trip.dto';
type SessionMode = 'assistant' | 'planner';
type PlanItem = {
    time: string;
    name: string;
    estimatedCost: number;
    note: string;
    tag?: string;
};
type DayPlan = {
    day: number;
    title: string;
    subtitle?: string;
    estimatedTotal?: number;
    items: PlanItem[];
};
type AiTripPlan = {
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
    daysPlan: DayPlan[];
};
export declare class AiTripsService {
    private prisma;
    private config;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService);
    listSessions(userId: string): Promise<{
        items: {
            id: string;
            mode: SessionMode;
            title: string;
            city: string;
            days: number;
            createdAt: Date;
            updatedAt: Date;
            lastMessageAt: Date;
            lastMessagePreview: string;
        }[];
    }>;
    getSession(userId: string, sessionId: string): Promise<{
        id: string;
        mode: SessionMode;
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
            prefs: Prisma.JsonArray;
            notes: string;
        };
        plan: AiTripPlan;
        messages: {
            id: string;
            role: import(".prisma/client").$Enums.ai_trip_message_role;
            text: string;
            createdAt: Date;
        }[];
    }>;
    generate(userId: string, dto: GenerateAiTripDto): Promise<{
        id: string;
        mode: SessionMode;
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
            prefs: Prisma.JsonArray;
            notes: string;
        };
        plan: AiTripPlan;
        messages: {
            id: string;
            role: import(".prisma/client").$Enums.ai_trip_message_role;
            text: string;
            createdAt: Date;
        }[];
    }>;
    startAssistantSession(userId: string, dto: ChatAiTripDto): Promise<{
        id: string;
        mode: SessionMode;
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
            prefs: Prisma.JsonArray;
            notes: string;
        };
        plan: AiTripPlan;
        messages: {
            id: string;
            role: import(".prisma/client").$Enums.ai_trip_message_role;
            text: string;
            createdAt: Date;
        }[];
    }>;
    chat(userId: string, sessionId: string, dto: ChatAiTripDto): Promise<{
        reply: string;
        patchedPlan: AiTripPlan;
        mode: string;
    }>;
    private resolveLocale;
    private parseId;
    private normalizePrefs;
    private getSessionMode;
    private buildAssistantSessionTitle;
    private hasOpenAiApiKey;
    private getOpenAiModel;
    private buildPlannerPlan;
    private buildPlannerPlanFallback;
    private buildAssistantPlaceholderPlan;
    private buildDayFocuses;
    private buildPlannerDayItems;
    private buildHighlights;
    private buildTips;
    private recalculatePlan;
    private enhancePlannerPlanWithOpenAi;
    private patchPlannerPlanWithOpenAi;
    private generateAssistantReplyWithOpenAi;
    private buildTripPlanSchema;
    private buildPlannerPatchSchema;
    private buildAssistantReplySchema;
    private mergePlanWithFallback;
    private pickBestStringList;
    private mapHistoryToOpenAiInput;
    private formatDestinationCatalog;
    private findDestinationByName;
    private requestOpenAiStructuredResponse;
    private extractOpenAiOutputText;
    private readOpenAiErrorMessage;
    private logAiServiceFallback;
    private patchPlannerPlan;
    private patchPlannerPlanFallback;
    private generateAssistantReply;
    private generateAssistantReplyFallback;
    private describeDestination;
    private suggestTripLength;
    private pickDestinationSuggestions;
    private containsAny;
    private extractAssistantContextLabel;
    private cleanAssistantContextLabel;
    private normalizeText;
    private findDestinationByCity;
    private readPlan;
    private mapSessionSummary;
    private mapSessionDetail;
}
export {};
