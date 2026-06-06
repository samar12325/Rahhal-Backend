"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DestinationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DestinationsService = class DestinationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(region) {
        const where = { is_active: true };
        if (region && region !== 'all') {
            where.region = region;
        }
        const items = await this.prisma.destinations.findMany({
            where,
            orderBy: [{ created_at: 'desc' }],
            select: {
                id: true,
                name: true,
                region: true,
                description: true,
                image_url: true,
            },
        });
        return items.map((destination) => ({
            ...destination,
            id: destination.id.toString(),
        }));
    }
    async getById(id) {
        if (!/^\d+$/.test(id)) {
            return null;
        }
        const destination = await this.prisma.destinations.findFirst({
            where: {
                id: BigInt(id),
                is_active: true,
            },
            select: {
                id: true,
                name: true,
                region: true,
                description: true,
                image_url: true,
            },
        });
        if (!destination) {
            return null;
        }
        return {
            ...destination,
            id: destination.id.toString(),
        };
    }
};
exports.DestinationsService = DestinationsService;
exports.DestinationsService = DestinationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DestinationsService);
//# sourceMappingURL=destinations.service.js.map