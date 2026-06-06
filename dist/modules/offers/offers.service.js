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
exports.OffersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const DEFAULT_IMAGE = 'https://placehold.co/640x360?text=Rahhal+Offer';
const REGION_LABELS = {
    central: 'الوسطى',
    west: 'الغربية',
    east: 'الشرقية',
    north: 'الشمالية',
    south: 'الجنوبية',
};
const REGION_ALIASES = {
    الوسطى: 'central',
    'المنطقة الوسطى': 'central',
    الغربية: 'west',
    'المنطقة الغربية': 'west',
    الشرقية: 'east',
    'المنطقة الشرقية': 'east',
    الشمالية: 'north',
    'المنطقة الشمالية': 'north',
    الجنوبية: 'south',
    'المنطقة الجنوبية': 'south',
};
const TAG_LABELS = {
    families: 'عائلات',
    adventure: 'مغامرة',
    culture: 'ثقافة',
    sea: 'بحر',
    shopping: 'تسوق',
};
const TAG_REVERSE = Object.entries(TAG_LABELS).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
}, {});
let OffersService = class OffersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(query) {
        const enforceOffers = await this.hasOffers();
        const where = this.buildWhere(query, enforceOffers);
        const trips = await this.prisma.trips.findMany({
            where,
            include: {
                destinations: {
                    select: { id: true, name: true, region: true, image_url: true },
                },
                trip_tags: { include: { tags: { select: { name: true } } } },
            },
            orderBy: { created_at: 'desc' },
        });
        const ratings = await this.loadRatings(trips.map((trip) => trip.id));
        let offers = trips.map((trip) => this.mapOffer(trip, ratings));
        offers = this.applySort(offers, query.sort);
        return { count: offers.length, offers };
    }
    async getById(id) {
        const enforceOffers = await this.hasOffers();
        const trip = await this.prisma.trips.findFirst({
            where: enforceOffers
                ? { id: BigInt(id), is_offer: true }
                : { id: BigInt(id) },
            include: {
                destinations: {
                    select: { id: true, name: true, region: true, image_url: true },
                },
                trip_tags: { include: { tags: { select: { name: true } } } },
            },
        });
        if (!trip) {
            throw new common_1.NotFoundException('Offer not found');
        }
        const ratings = await this.loadRatings([trip.id]);
        return this.mapOffer(trip, ratings);
    }
    buildWhere(query, enforceOffers) {
        const where = {
            destinations: { is_active: true },
            status: {
                in: [client_1.trips_status.open, client_1.trips_status.draft, client_1.trips_status.full],
            },
        };
        if (enforceOffers)
            where.is_offer = true;
        const regionKey = this.normalizeRegion(query.region);
        if (regionKey) {
            where.destinations = { is_active: true, region: regionKey };
        }
        if (query.minPrice || query.maxPrice) {
            where.price_per_person = {};
            if (query.minPrice) {
                where.price_per_person.gte = new client_1.Prisma.Decimal(query.minPrice);
            }
            if (query.maxPrice) {
                where.price_per_person.lte = new client_1.Prisma.Decimal(query.maxPrice);
            }
        }
        if (query.q?.trim()) {
            const search = query.q.trim();
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
                { destinations: { name: { contains: search } } },
            ];
        }
        if (query.tag?.trim() && query.tag.trim() !== 'all') {
            const candidates = this.tagCandidates(query.tag);
            if (candidates.length) {
                where.trip_tags = {
                    some: { tags: { name: { in: candidates } } },
                };
            }
        }
        return where;
    }
    async hasOffers() {
        const count = await this.prisma.trips.count({ where: { is_offer: true } });
        return count > 0;
    }
    mapOffer(trip, ratings) {
        const newPrice = trip.price_per_person !== null && trip.price_per_person !== undefined
            ? Number(trip.price_per_person)
            : null;
        const oldPrice = trip.old_price !== null && trip.old_price !== undefined
            ? Number(trip.old_price)
            : newPrice;
        const discountPercent = newPrice !== null && oldPrice !== null && oldPrice > 0
            ? Math.max(0, Math.round(((oldPrice - newPrice) / oldPrice) * 100))
            : 0;
        const ratingStats = ratings.get(trip.id.toString());
        const rating = ratingStats
            ? Number((ratingStats.sum / ratingStats.count).toFixed(1))
            : 0;
        const destinationName = trip.destinations?.name ?? '';
        const region = this.toArabicRegion(trip.destinations?.region ?? null);
        const imageUrl = trip.image_url ?? trip.destinations?.image_url ?? DEFAULT_IMAGE;
        const durationDays = trip.duration_days ??
            this.calculateDurationDays(trip.start_date, trip.end_date);
        const duration = durationDays ? this.formatDuration(durationDays) : '—';
        const includes = this.extractIncludes(trip.includes, trip.description);
        const tags = this.normalizeTags((trip.trip_tags ?? []).map((item) => item.tags?.name).filter(Boolean));
        return {
            id: trip.id.toString(),
            title: trip.title,
            destination: destinationName,
            region,
            duration,
            includes,
            oldPrice,
            newPrice,
            discountPercent,
            rating,
            tags,
            availability: trip.status === client_1.trips_status.open ? 'available' : 'soon',
            image: imageUrl,
            destination_id: trip.destination_id.toString(),
        };
    }
    normalizeRegion(region) {
        if (!region)
            return null;
        const trimmed = region.trim();
        const lower = trimmed.toLowerCase();
        if (lower in REGION_LABELS) {
            return lower;
        }
        return REGION_ALIASES[trimmed] ?? null;
    }
    toArabicRegion(region) {
        if (!region)
            return '';
        return REGION_LABELS[region] ?? region;
    }
    formatDuration(days) {
        if (days === 1)
            return 'يوم';
        if (days === 2)
            return 'يومين';
        return `${days} أيام`;
    }
    calculateDurationDays(start, end) {
        if (!start || !end)
            return null;
        const diff = end.getTime() - start.getTime();
        return Math.max(1, Math.round(diff / 86400000) + 1);
    }
    extractIncludes(value, description) {
        if (Array.isArray(value)) {
            return value.filter((item) => typeof item === 'string');
        }
        if (!description)
            return [];
        const lines = description
            .split(/\r?\n/)
            .map((line) => line.replace(/^[-•]\s*/, '').trim())
            .filter(Boolean);
        if (lines.length <= 1)
            return [];
        return lines.slice(0, 5);
    }
    normalizeTags(tags) {
        return tags.map((tag) => {
            const normalized = tag.trim();
            const lower = normalized.toLowerCase();
            if (TAG_LABELS[lower])
                return TAG_LABELS[lower];
            if (TAG_REVERSE[normalized])
                return TAG_LABELS[TAG_REVERSE[normalized]];
            return normalized;
        });
    }
    tagCandidates(tag) {
        const trimmed = tag.trim();
        const lower = trimmed.toLowerCase();
        const candidates = new Set();
        if (trimmed)
            candidates.add(trimmed);
        if (TAG_LABELS[lower])
            candidates.add(TAG_LABELS[lower]);
        if (TAG_REVERSE[trimmed])
            candidates.add(TAG_REVERSE[trimmed]);
        return Array.from(candidates);
    }
    async loadRatings(tripIds) {
        const map = new Map();
        if (!tripIds.length)
            return map;
        const reviews = await this.prisma.reviews.findMany({
            where: { bookings: { trip_id: { in: tripIds } } },
            select: {
                rating: true,
                bookings: { select: { trip_id: true } },
            },
        });
        for (const review of reviews) {
            const tripId = review.bookings.trip_id.toString();
            const current = map.get(tripId) ?? { sum: 0, count: 0 };
            map.set(tripId, {
                sum: current.sum + Number(review.rating),
                count: current.count + 1,
            });
        }
        return map;
    }
    applySort(offers, sort) {
        const list = [...offers];
        if (sort === 'lowestPrice') {
            list.sort((a, b) => (a.newPrice ?? 0) - (b.newPrice ?? 0));
            return list;
        }
        if (sort === 'highestRated') {
            list.sort((a, b) => b.rating - a.rating);
            return list;
        }
        if (sort === 'mostDiscount') {
            list.sort((a, b) => b.discountPercent - a.discountPercent);
        }
        return list;
    }
};
exports.OffersService = OffersService;
exports.OffersService = OffersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OffersService);
//# sourceMappingURL=offers.service.js.map