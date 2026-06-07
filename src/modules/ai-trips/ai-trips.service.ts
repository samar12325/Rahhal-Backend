import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, ai_trip_message_role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatAiTripDto } from './dto/chat-ai-trip.dto';
import { GenerateAiTripDto } from './dto/generate-ai-trip.dto';

type SupportedLocale = 'ar' | 'en';
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

type DestinationSummary = {
  name: string;
  region: string;
  description: string | null;
};

type AssistantReplyResult = {
  reply: string;
  primaryDestination: DestinationSummary | null;
  contextLabel: string | null;
};

type SessionMessageRecord = {
  role: ai_trip_message_role;
  text: string;
};

type AssistantModelPayload = {
  reply: string;
  primaryDestinationName: string;
  contextLabel: string;
};

type PlannerPatchPayload = {
  reply: string;
  plan: AiTripPlan;
};

type OpenAiInputMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type SessionSummaryRecord = Prisma.ai_trip_sessionsGetPayload<{
  include: {
    ai_trip_messages: {
      orderBy: {
        created_at: 'desc';
      };
      take: 1;
    };
  };
}>;

type SessionDetailRecord = Prisma.ai_trip_sessionsGetPayload<{
  include: {
    ai_trip_messages: {
      orderBy: {
        created_at: 'asc';
      };
    };
  };
}>;

const SESSION_STYLE_ASSISTANT = '__assistant__';

const AI_COPY = {
  ar: {
    unknownCity: 'وجهة غير محددة',
    assistantTitle: 'محادثة سفر',
    assistantAudience: 'استشارة مرنة',
    assistantOverview:
      'استخدم هذا المسار للدردشة الحرة عن المدن والأجواء والمقارنات قبل ما تقرر جدولك.',
    styles: {
      all: 'متوازن',
      family: 'عائلية',
      adventure: 'مغامرات',
      culture: 'ثقافية',
      relax: 'استرخاء',
      shopping: 'تسوق',
    },
    prefs: {
      nature: 'طبيعة',
      history: 'تاريخ',
      restaurants: 'مطاعم',
      events: 'فعاليات',
      sea: 'بحر',
      mountains: 'جبال',
      photography: 'تصوير',
    },
    regionLabels: {
      central: 'المنطقة الوسطى',
      west: 'المنطقة الغربية',
      east: 'المنطقة الشرقية',
      north: 'المنطقة الشمالية',
      south: 'المنطقة الجنوبية',
    },
    timeTags: {
      morning: 'صباح',
      midday: 'ظهر',
      sunset: 'مساء',
      night: 'ليل',
      extra: 'إضافة',
    },
    sessionTitle: (city: string, days: number) =>
      `رحلة ${days} أيام في ${city}`,
    styleTitle: (style: string) => `إيقاع ${style}`,
    daySubtitle: (city: string, label: string) => `${label} داخل ${city}`,
    planTitle: (city: string, days: number) => `خطة ${days} أيام في ${city}`,
    summaryOverview: (city: string, style: string, audience: string) =>
      `خطة منظمة لزيارة ${city} بروح ${style} ومناسبة لـ ${audience}.`,
    audienceLabel: (people: number) => {
      if (people <= 1) return 'شخص واحد';
      if (people === 2) return 'شخصين';
      if (people <= 5) return `${people} أشخاص`;
      return `مجموعة من ${people}`;
    },
    budgetLabel: (minBudget: number | string, maxBudget: number | string) =>
      `${minBudget} - ${maxBudget}`,
    plannerTips: {
      budget:
        'احجز الأنشطة المدفوعة مبكراً وخلك مرن في الوجبات لتوازن الميزانية.',
      pace: 'وزّع الأنشطة الثقيلة على يومين مختلفين حتى تكون الرحلة أريح.',
      family: 'اختر نقاط توقف قصيرة إذا كان معك أطفال أو كبار سن.',
      photo: 'خصص ساعة ذهبية قبل الغروب للتصوير والمشي الخفيف.',
    },
    plannerReplies: {
      default: 'عدّلت الجدول وخليته أوضح وأكثر توازنًا.',
      cheaper: 'خففت التكلفة التقديرية ووجهت الخطة لخيارات اقتصادية أكثر.',
      nature: 'أضفت توقفات طبيعة ومطل داخل الأيام المناسبة.',
      restaurants: 'أضفت اقتراحات أكل وعشاء بشكل أوضح داخل الأيام.',
      shopping: 'أدخلت وقت مخصص للتسوق بدون ما يضغط باقي اليوم.',
      family: 'حوّلت البرنامج إلى طابع عائلي أكثر وخففت الإيقاع.',
      day2: 'خففت اليوم الثاني وخليته أخف من بقية الأيام.',
    },
    assistantReplies: {
      compareIntro: 'إذا كنت محتار بين الوجهتين، هذا الفرق العملي:',
      recommendationIntro: 'هذه ترشيحات مناسبة كبداية:',
      askClarify:
        'قل لي: تبي بحر، جو بارد، أماكن تصوير، مطاعم، أو رحلة عائلية؟ وأنا أضبط الترشيح لك.',
      noExactMatch:
        'أقدر أساعدك، لكن اذكر لي اسم مدينة أو نوع التجربة التي تبحث عنها حتى يكون الجواب أدق.',
      followUp:
        'إذا تبغى، أقدر بعد ذلك أحول الكلام هذا إلى جدول يومي منظم بضغطة واحدة.',
    },
  },
  en: {
    unknownCity: 'Unspecified destination',
    assistantTitle: 'Travel chat',
    assistantAudience: 'Flexible consultation',
    assistantOverview:
      'Use this mode for open-ended travel chat about cities, atmosphere, and comparisons before generating an itinerary.',
    styles: {
      all: 'Balanced',
      family: 'Family',
      adventure: 'Adventure',
      culture: 'Cultural',
      relax: 'Relaxed',
      shopping: 'Shopping',
    },
    prefs: {
      nature: 'Nature',
      history: 'History',
      restaurants: 'Restaurants',
      events: 'Events',
      sea: 'Sea',
      mountains: 'Mountains',
      photography: 'Photography',
    },
    regionLabels: {
      central: 'Central region',
      west: 'Western region',
      east: 'Eastern region',
      north: 'Northern region',
      south: 'Southern region',
    },
    timeTags: {
      morning: 'Morning',
      midday: 'Midday',
      sunset: 'Sunset',
      night: 'Night',
      extra: 'Extra',
    },
    sessionTitle: (city: string, days: number) => `${days}-day trip in ${city}`,
    styleTitle: (style: string) => `${style} pace`,
    daySubtitle: (city: string, label: string) => `${label} in ${city}`,
    planTitle: (city: string, days: number) => `${days}-day plan for ${city}`,
    summaryOverview: (city: string, style: string, audience: string) =>
      `A structured ${style.toLowerCase()} itinerary for ${city}, suitable for ${audience}.`,
    audienceLabel: (people: number) => {
      if (people <= 1) return 'solo travel';
      if (people === 2) return 'two travelers';
      if (people <= 5) return `${people} travelers`;
      return `a group of ${people}`;
    },
    budgetLabel: (minBudget: number | string, maxBudget: number | string) =>
      `${minBudget} - ${maxBudget}`,
    plannerTips: {
      budget:
        'Book major paid activities early and keep meal choices flexible to balance budget.',
      pace: 'Spread demanding activities across different days to keep the trip comfortable.',
      family:
        'Use shorter stops if you are traveling with children or older family members.',
      photo:
        'Keep one golden-hour slot before sunset for photos and a light walk.',
    },
    plannerReplies: {
      default: 'I refined the itinerary and made it more balanced.',
      cheaper:
        'I reduced the estimated cost and leaned toward budget-friendly options.',
      nature: 'I added nature and scenic stops to suitable days.',
      restaurants:
        'I added clearer food and dinner suggestions across the itinerary.',
      shopping:
        'I inserted shopping time without squeezing the rest of the day.',
      family: 'I shifted the itinerary to a more family-friendly pace.',
      day2: 'I made day two lighter than the rest of the itinerary.',
    },
    assistantReplies: {
      compareIntro:
        'If you are choosing between the two, here is the practical difference:',
      recommendationIntro: 'These are good starting recommendations:',
      askClarify:
        'Tell me if you want sea, cool weather, photo spots, restaurants, or a family trip and I will narrow it down.',
      noExactMatch:
        'I can help, but mention a city name or the type of experience you want so the answer can be more specific.',
      followUp:
        'If you want, I can turn this into a structured day-by-day itinerary next.',
    },
  },
} as const;

@Injectable()
export class AiTripsService {
  private readonly logger = new Logger(AiTripsService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async listSessions(userId: string) {
    const sessions = await this.prisma.ai_trip_sessions.findMany({
      where: { user_id: BigInt(userId) },
      include: {
        ai_trip_messages: {
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
      orderBy: [{ updated_at: 'desc' }, { created_at: 'desc' }],
    });

    return {
      items: sessions.map((session) => this.mapSessionSummary(session)),
    };
  }

  async getSession(userId: string, sessionId: string) {
    const session = await this.prisma.ai_trip_sessions.findFirst({
      where: {
        id: this.parseId(sessionId),
        user_id: BigInt(userId),
      },
      include: {
        ai_trip_messages: {
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('AI trip session not found');
    }

    return this.mapSessionDetail(session);
  }

  async generate(userId: string, dto: GenerateAiTripDto) {
    const locale = this.resolveLocale(dto.locale);
    const normalizedPrefs = this.normalizePrefs(dto.prefs);
    const city = dto.city?.trim() || AI_COPY[locale].unknownCity;
    const plan = await this.buildPlannerPlan(
      {
        ...dto,
        city,
        prefs: normalizedPrefs,
      },
      locale,
    );
    const now = new Date();

    const created = await this.prisma.ai_trip_sessions.create({
      data: {
        user_id: BigInt(userId),
        title: plan.tripTitle,
        city: plan.city,
        days: plan.days,
        people: dto.people,
        min_budget:
          dto.minBudget !== undefined
            ? new Prisma.Decimal(dto.minBudget)
            : null,
        max_budget:
          dto.maxBudget !== undefined
            ? new Prisma.Decimal(dto.maxBudget)
            : null,
        style: dto.style?.trim() || 'all',
        prefs: normalizedPrefs as Prisma.InputJsonValue,
        notes: dto.notes?.trim() || null,
        locale,
        plan_json: plan as Prisma.InputJsonValue,
        updated_at: now,
      },
      include: {
        ai_trip_messages: {
          orderBy: { created_at: 'asc' },
        },
      },
    });

    return this.mapSessionDetail(created);
  }

  async startAssistantSession(userId: string, dto: ChatAiTripDto) {
    const locale = this.resolveLocale(dto.locale);
    const message = dto.message.trim();
    const assistant = await this.generateAssistantReply(message, locale);
    const now = new Date();
    const assistantContext =
      assistant.contextLabel ||
      assistant.primaryDestination?.name ||
      this.extractAssistantContextLabel(message, locale);
    const plan = this.buildAssistantPlaceholderPlan(
      locale,
      assistantContext || AI_COPY[locale].unknownCity,
    );

    const created = await this.prisma.$transaction(async (tx) => {
      const session = await tx.ai_trip_sessions.create({
        data: {
          user_id: BigInt(userId),
          title: assistantContext || this.buildAssistantSessionTitle(message),
          city: assistantContext || AI_COPY[locale].unknownCity,
          days: 1,
          people: 1,
          style: SESSION_STYLE_ASSISTANT,
          prefs: [] as Prisma.InputJsonValue,
          notes: null,
          locale,
          plan_json: plan as Prisma.InputJsonValue,
          updated_at: now,
          last_message_at: now,
        },
      });

      await tx.ai_trip_messages.create({
        data: {
          session_id: session.id,
          role: ai_trip_message_role.user,
          text: message,
        },
      });

      await tx.ai_trip_messages.create({
        data: {
          session_id: session.id,
          role: ai_trip_message_role.assistant,
          text: assistant.reply,
          plan_json: plan as Prisma.InputJsonValue,
        },
      });

      return tx.ai_trip_sessions.findFirst({
        where: { id: session.id },
        include: {
          ai_trip_messages: {
            orderBy: { created_at: 'asc' },
          },
        },
      });
    });

    if (!created) {
      throw new NotFoundException('AI trip session not found');
    }

    return this.mapSessionDetail(created);
  }

  async chat(userId: string, sessionId: string, dto: ChatAiTripDto) {
    const id = this.parseId(sessionId);
    const session = await this.prisma.ai_trip_sessions.findFirst({
      where: {
        id,
        user_id: BigInt(userId),
      },
      include: {
        ai_trip_messages: {
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('AI trip session not found');
    }

    const locale = this.resolveLocale(dto.locale ?? session.locale);
    const currentPlan = this.readPlan(session.plan_json);
    const isAssistantSession =
      this.getSessionMode(session.style) === 'assistant';
    const now = new Date();

    let reply = '';
    let patchedPlan = currentPlan;
    let nextCity = session.city;
    let nextTitle = session.title;

    if (isAssistantSession) {
      const assistant = await this.generateAssistantReply(
        dto.message.trim(),
        locale,
        session.ai_trip_messages,
      );
      const assistantContext =
        assistant.contextLabel ||
        assistant.primaryDestination?.name ||
        this.extractAssistantContextLabel(dto.message.trim(), locale);
      reply = assistant.reply;
      nextCity = assistantContext || session.city;
      patchedPlan = this.buildAssistantPlaceholderPlan(locale, nextCity);
      nextTitle =
        assistantContext ||
        session.title?.trim() ||
        this.buildAssistantSessionTitle(dto.message.trim());
    } else {
      const updated = await this.patchPlannerPlan(
        dto.message.trim(),
        currentPlan,
        locale,
        session.ai_trip_messages,
      );
      reply = updated.reply;
      patchedPlan = updated.patchedPlan;
      nextCity = patchedPlan.city;
      nextTitle = patchedPlan.tripTitle;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.ai_trip_messages.create({
        data: {
          session_id: id,
          role: ai_trip_message_role.user,
          text: dto.message.trim(),
        },
      });

      await tx.ai_trip_messages.create({
        data: {
          session_id: id,
          role: ai_trip_message_role.assistant,
          text: reply,
          plan_json: patchedPlan as Prisma.InputJsonValue,
        },
      });

      await tx.ai_trip_sessions.update({
        where: { id },
        data: {
          city: nextCity,
          plan_json: patchedPlan as Prisma.InputJsonValue,
          title: nextTitle,
          locale,
          updated_at: now,
          last_message_at: now,
        },
      });
    });

    return {
      reply,
      patchedPlan,
      mode: isAssistantSession ? 'assistant' : 'planner',
    };
  }

  private resolveLocale(value?: string | null): SupportedLocale {
    return value === 'en' ? 'en' : 'ar';
  }

  private parseId(value: string) {
    if (!/^\d+$/.test(value)) {
      throw new NotFoundException('AI trip session not found');
    }

    return BigInt(value);
  }

  private normalizePrefs(prefs?: string[]) {
    return Array.isArray(prefs)
      ? prefs
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 10)
      : [];
  }

  private getSessionMode(style?: string | null): SessionMode {
    return style === SESSION_STYLE_ASSISTANT ? 'assistant' : 'planner';
  }

  private buildAssistantSessionTitle(message: string) {
    const normalized = message.replace(/\s+/g, ' ').trim();
    return normalized.length > 42
      ? `${normalized.slice(0, 42).trim()}...`
      : normalized;
  }

  private hasOpenAiApiKey() {
    return Boolean(this.config.get<string>('OPENAI_API_KEY')?.trim());
  }

  private getOpenAiModel() {
    return this.config.get<string>('OPENAI_MODEL')?.trim() || 'gpt-4.1-mini';
  }

  private async buildPlannerPlan(
    dto: GenerateAiTripDto,
    locale: SupportedLocale,
  ): Promise<AiTripPlan> {
    const draftPlan = await this.buildPlannerPlanFallback(dto, locale);

    if (!this.hasOpenAiApiKey()) {
      return draftPlan;
    }

    try {
      return await this.enhancePlannerPlanWithOpenAi(dto, locale, draftPlan);
    } catch (error) {
      this.logAiServiceFallback('planner generation', error);
      return draftPlan;
    }
  }

  private async buildPlannerPlanFallback(
    dto: GenerateAiTripDto,
    locale: SupportedLocale,
  ): Promise<AiTripPlan> {
    const copy = AI_COPY[locale];
    const city = dto.city?.trim() || copy.unknownCity;
    const days = Math.max(1, Number(dto.days || 1));
    const people = Math.max(1, Number(dto.people || 1));
    const minBudget =
      dto.minBudget !== undefined && dto.minBudget !== null ? dto.minBudget : 0;
    const maxBudget =
      dto.maxBudget !== undefined && dto.maxBudget !== null
        ? dto.maxBudget
        : '∞';
    const style = dto.style?.trim() || 'all';
    const styleLabel =
      copy.styles[style as keyof typeof copy.styles] ?? copy.styles.all;
    const prefs = this.normalizePrefs(dto.prefs);
    const audienceLabel = copy.audienceLabel(people);
    const destination = await this.findDestinationByCity(city);
    const dayFocuses = this.buildDayFocuses(style, prefs, locale, days);
    const daysPlan = Array.from({ length: days }).map((_, index) => {
      const focus = dayFocuses[index % dayFocuses.length];
      const items = this.buildPlannerDayItems(focus, locale, people);
      return {
        day: index + 1,
        title: focus.title,
        subtitle: copy.daySubtitle(city, focus.subtitle),
        items,
      };
    });

    const baseOverview = destination?.description?.trim()
      ? destination.description.trim().slice(0, 160)
      : copy.summaryOverview(city, styleLabel, audienceLabel);

    const plan: AiTripPlan = {
      city,
      days,
      budgetLabel: copy.budgetLabel(minBudget, maxBudget),
      tripTitle: copy.planTitle(city, days),
      overview: baseOverview,
      estimatedTotal: 0,
      styleLabel: copy.styleTitle(styleLabel),
      audienceLabel,
      highlights: this.buildHighlights(style, prefs, locale, destination),
      tips: this.buildTips(style, prefs, locale),
      daysPlan,
    };

    return this.recalculatePlan(plan);
  }

  private buildAssistantPlaceholderPlan(
    locale: SupportedLocale,
    city: string,
  ): AiTripPlan {
    const copy = AI_COPY[locale];

    return {
      city,
      days: 1,
      budgetLabel: '-',
      tripTitle: copy.assistantTitle,
      overview: copy.assistantOverview,
      estimatedTotal: 0,
      styleLabel: copy.assistantTitle,
      audienceLabel: copy.assistantAudience,
      highlights: [],
      tips: [],
      daysPlan: [],
    };
  }

  private buildDayFocuses(
    style: string,
    prefs: string[],
    locale: SupportedLocale,
    days: number,
  ) {
    const selected = new Set(prefs);
    const focusPool: Array<{ title: string; subtitle: string; vibe: string }> =
      [];

    if (style === 'culture' || selected.has('history')) {
      focusPool.push(
        locale === 'ar'
          ? {
              title: 'ممرات ثقافية',
              subtitle: 'معالم وهوية المدينة',
              vibe: 'culture',
            }
          : {
              title: 'Cultural route',
              subtitle: 'Landmarks and city identity',
              vibe: 'culture',
            },
      );
    }

    if (style === 'family') {
      focusPool.push(
        locale === 'ar'
          ? { title: 'برنامج عائلي', subtitle: 'خفيف ومريح', vibe: 'family' }
          : {
              title: 'Family-friendly day',
              subtitle: 'Light and comfortable',
              vibe: 'family',
            },
      );
    }

    if (style === 'shopping' || selected.has('restaurants')) {
      focusPool.push(
        locale === 'ar'
          ? { title: 'أكل وأسواق', subtitle: 'تجربة محلية مرنة', vibe: 'food' }
          : {
              title: 'Food and shopping',
              subtitle: 'Flexible local experience',
              vibe: 'food',
            },
      );
    }

    if (
      style === 'relax' ||
      selected.has('nature') ||
      selected.has('sea') ||
      selected.has('mountains')
    ) {
      focusPool.push(
        locale === 'ar'
          ? {
              title: 'إيقاع هادئ',
              subtitle: 'مشي ومطل واسترخاء',
              vibe: 'nature',
            }
          : {
              title: 'Relaxed pace',
              subtitle: 'Walks, views, and downtime',
              vibe: 'nature',
            },
      );
    }

    if (style === 'adventure' || selected.has('events')) {
      focusPool.push(
        locale === 'ar'
          ? {
              title: 'يوم نشِط',
              subtitle: 'فعالية وتجربة مختلفة',
              vibe: 'activity',
            }
          : {
              title: 'Active day',
              subtitle: 'Event and standout experience',
              vibe: 'activity',
            },
      );
    }

    if (selected.has('photography')) {
      focusPool.push(
        locale === 'ar'
          ? {
              title: 'زوايا تصوير',
              subtitle: 'أماكن فوتوجينيك وتوقفات قصيرة',
              vibe: 'photo',
            }
          : {
              title: 'Photo-friendly route',
              subtitle: 'Scenic spots and short stops',
              vibe: 'photo',
            },
      );
    }

    if (focusPool.length === 0) {
      focusPool.push(
        locale === 'ar'
          ? {
              title: 'يوم متوازن',
              subtitle: 'مشاهد وتجارب خفيفة',
              vibe: 'balanced',
            }
          : {
              title: 'Balanced day',
              subtitle: 'Sights and light experiences',
              vibe: 'balanced',
            },
      );
    }

    return focusPool.slice(0, Math.max(1, Math.min(days, focusPool.length)));
  }

  private buildPlannerDayItems(
    focus: { vibe: string },
    locale: SupportedLocale,
    people: number,
  ): PlanItem[] {
    const copy = AI_COPY[locale];
    const multiplier = Math.max(1, Math.min(people, 4));

    const libraries: Record<
      string,
      {
        breakfast: [string, string];
        midday: [string, string];
        sunset: [string, string];
        night: [string, string];
      }
    > = {
      culture:
        locale === 'ar'
          ? {
              breakfast: [
                'قهوة ومخبوزات قرب المعالم',
                'بداية خفيفة قبل الجولات التاريخية',
              ],
              midday: [
                'زيارة معلم رئيسي / حي تاريخي',
                'التركيز على هوية المدينة وتجربتها',
              ],
              sunset: [
                'غداء محلي + توقف ثقافي',
                'اختر مطعمًا بطابع محلي قريب من الجولة',
              ],
              night: ['مشي مسائي وسوق خفيف', 'وقت مناسب للتصوير والهدوء'],
            }
          : {
              breakfast: [
                'Coffee and pastries near the landmarks',
                'A light start before cultural stops',
              ],
              midday: [
                'Visit a key landmark / historic district',
                'Focus on the city identity and story',
              ],
              sunset: [
                'Local lunch + cultural stop',
                'Choose a local-leaning restaurant nearby',
              ],
              night: [
                'Evening walk and light market stop',
                'A good window for photos and calm pacing',
              ],
            },
      family:
        locale === 'ar'
          ? {
              breakfast: ['فطور هادئ وقريب', 'تقليل التنقلات في بداية اليوم'],
              midday: ['نشاط عائلي رئيسي', 'وجهة مريحة وسهلة الحركة'],
              sunset: ['غداء وجلسة مفتوحة', 'اختر مكانًا فيه جلسات أوسع'],
              night: ['ممشى أو مساحة ترفيه خفيفة', 'بدون ضغط أو تنقلات كثيرة'],
            }
          : {
              breakfast: [
                'Easy nearby breakfast',
                'Keep movement light at the start of the day',
              ],
              midday: [
                'Main family activity',
                'Comfortable destination with smooth access',
              ],
              sunset: [
                'Lunch and an open-air break',
                'Pick a venue with more spacious seating',
              ],
              night: [
                'Promenade or light leisure stop',
                'No heavy pacing or too much movement',
              ],
            },
      food:
        locale === 'ar'
          ? {
              breakfast: [
                'فطور مميز وتجربة قهوة',
                'بداية بطابع محلي ومكان لطيف',
              ],
              midday: ['سوق / شارع مشهور', 'مرور على محلات وتجارب خفيفة'],
              sunset: ['غداء ترشيح مميز', 'التركيز هنا على الأكل والجلسة'],
              night: ['عشاء أو حلوى ليلية', 'جرّب مكانًا مشهورًا أو ترند محلي'],
            }
          : {
              breakfast: [
                'Special breakfast and coffee stop',
                'Start with a local-feeling venue',
              ],
              midday: [
                'Market / well-known street',
                'Browse shops and light experiences',
              ],
              sunset: [
                'Strong lunch pick',
                'This stop centers on food and atmosphere',
              ],
              night: [
                'Dinner or late dessert stop',
                'Try a popular or trending local spot',
              ],
            },
      nature:
        locale === 'ar'
          ? {
              breakfast: ['فطور هادئ قبل الانطلاق', 'بداية مرنة لليوم'],
              midday: [
                'مطل أو حديقة أو تجربة طبيعية',
                'أفضل وقت للمشي الخفيف واستكشاف المكان',
              ],
              sunset: ['غداء بإطلالة', 'حاول اختيار جلسة فيها منظر مفتوح'],
              night: ['جلسة غروب / ممشى', 'إيقاع أخف مع فرصة تصوير ممتازة'],
            }
          : {
              breakfast: [
                'Calm breakfast before heading out',
                'A flexible start to the day',
              ],
              midday: [
                'Viewpoint, park, or nature-led stop',
                'A good slot for light walking and exploring',
              ],
              sunset: [
                'Lunch with a view',
                'Pick a place with an open outlook',
              ],
              night: [
                'Sunset stop / promenade',
                'A lighter pace with strong photo potential',
              ],
            },
      activity:
        locale === 'ar'
          ? {
              breakfast: [
                'فطور سريع وانطلاق',
                'اليوم فيه حركة أكثر من المعتاد',
              ],
              midday: [
                'فعالية أو تجربة رئيسية',
                'هذا هو النشاط الأقوى في اليوم',
              ],
              sunset: ['غداء واستراحة قصيرة', 'استرجاع الطاقة قبل المساء'],
              night: [
                'جولة مسائية حيوية',
                'اختم اليوم بتجربة اجتماعية أو مكان نابض',
              ],
            }
          : {
              breakfast: [
                'Quick breakfast and start',
                'This day has more movement than usual',
              ],
              midday: [
                'Main event or standout experience',
                'This is the strongest activity of the day',
              ],
              sunset: [
                'Lunch and short reset',
                'Recharge before the evening segment',
              ],
              night: [
                'Lively evening round',
                'End the day with a social or energetic stop',
              ],
            },
      photo:
        locale === 'ar'
          ? {
              breakfast: [
                'قهوة صباحية لطيفة',
                'بداية هادئة مع إضاءة صباحية جميلة',
              ],
              midday: [
                'نقطة تصوير / حي مميز',
                'اختيار أماكن فيها تفاصيل بصرية قوية',
              ],
              sunset: ['غداء خفيف', 'حتى يبقى وقت كافٍ للغروب'],
              night: [
                'توقف ذهبي قبل الغروب + ممشى',
                'الجزء الأجمل للتصوير في هذا اليوم',
              ],
            }
          : {
              breakfast: [
                'Easy coffee stop',
                'A calm start with pleasant morning light',
              ],
              midday: [
                'Photo stop / character-rich district',
                'Choose visually strong places',
              ],
              sunset: ['Light lunch', 'Keep enough time open for golden hour'],
              night: [
                'Golden-hour stop + promenade',
                'The best visual stretch of the day',
              ],
            },
      balanced:
        locale === 'ar'
          ? {
              breakfast: ['فطور وتجهيز', 'اقتراح قريب من السكن'],
              midday: [
                'معلم رئيسي أو تجربة خفيفة',
                'اختيار مرن حسب المزاج والميزانية',
              ],
              sunset: ['غداء مناسب للميزانية', 'بدون تكلف أو تنقلات طويلة'],
              night: ['جولة مسائية هادئة', 'ممشى أو سوق أو كورنيش'],
            }
          : {
              breakfast: ['Breakfast and prep', 'A nearby option to your stay'],
              midday: [
                'Main sight or light experience',
                'Flexible based on mood and budget',
              ],
              sunset: [
                'Budget-friendly lunch',
                'No heavy movement or extra friction',
              ],
              night: ['Calm evening round', 'Promenade, market, or waterfront'],
            },
    };

    const library = libraries[focus.vibe] ?? libraries.balanced;

    return [
      {
        time: '08:30',
        tag: copy.timeTags.morning,
        name: library.breakfast[0],
        estimatedCost: 35 * multiplier,
        note: library.breakfast[1],
      },
      {
        time: '11:00',
        tag: copy.timeTags.midday,
        name: library.midday[0],
        estimatedCost: 80 * multiplier,
        note: library.midday[1],
      },
      {
        time: '14:30',
        tag: copy.timeTags.sunset,
        name: library.sunset[0],
        estimatedCost: 60 * multiplier,
        note: library.sunset[1],
      },
      {
        time: '18:00',
        tag: copy.timeTags.night,
        name: library.night[0],
        estimatedCost: 20 * multiplier,
        note: library.night[1],
      },
    ];
  }

  private buildHighlights(
    style: string,
    prefs: string[],
    locale: SupportedLocale,
    destination: DestinationSummary | null,
  ) {
    const copy = AI_COPY[locale];
    const items: string[] = [];

    if (destination?.region) {
      items.push(
        copy.regionLabels[
          destination.region as keyof typeof copy.regionLabels
        ] ?? destination.region,
      );
    }

    const styleLabel = copy.styles[style as keyof typeof copy.styles];
    if (styleLabel) {
      items.push(styleLabel);
    }

    prefs.forEach((pref) => {
      const label = copy.prefs[pref as keyof typeof copy.prefs];
      if (label) items.push(label);
    });

    return [...new Set(items)].slice(0, 5);
  }

  private buildTips(style: string, prefs: string[], locale: SupportedLocale) {
    const copy = AI_COPY[locale];
    const tips: string[] = [copy.plannerTips.budget, copy.plannerTips.pace];

    if (style === 'family') {
      tips.push(copy.plannerTips.family);
    }

    if (prefs.includes('photography') || prefs.includes('nature')) {
      tips.push(copy.plannerTips.photo);
    }

    return tips.slice(0, 3);
  }

  private recalculatePlan(plan: AiTripPlan): AiTripPlan {
    const daysPlan = plan.daysPlan.map((day) => {
      const estimatedTotal = day.items.reduce(
        (sum, item) => sum + Number(item.estimatedCost || 0),
        0,
      );

      return {
        ...day,
        estimatedTotal,
      };
    });

    return {
      ...plan,
      daysPlan,
      estimatedTotal: daysPlan.reduce(
        (sum, day) => sum + Number(day.estimatedTotal || 0),
        0,
      ),
    };
  }

  private async enhancePlannerPlanWithOpenAi(
    dto: GenerateAiTripDto,
    locale: SupportedLocale,
    draftPlan: AiTripPlan,
  ) {
    const copy = AI_COPY[locale];
    const payload = await this.requestOpenAiStructuredResponse<AiTripPlan>({
      instructions:
        locale === 'ar'
          ? [
              'أنت مصمم جداول سفر احترافي داخل تطبيق رحّال.',
              'حوّل مسودة الجدول إلى نسخة أجمل وأكثر واقعية ومنظمة، مع لغة عربية طبيعية وواضحة.',
              'أعد نفس البنية المطلوبة فقط بصيغة JSON مطابقة تمامًا للمخطط.',
              'حافظ على عدد الأيام كما هو، وعلى وجود عناصر يومية بوقت واضح وتكلفة رقمية صحيحة بالريال السعودي.',
              'حسّن العناوين، النظرة العامة، النقاط البارزة، النصائح، وأسماء الأنشطة بحيث تبدو مناسبة لموقع سفر حقيقي.',
            ].join('\n')
          : [
              'You are an expert trip planner inside the Rahhal travel app.',
              'Upgrade the draft itinerary into a polished, realistic, user-facing plan in natural English.',
              'Return only JSON that matches the required schema exactly.',
              'Keep the same number of days and make sure each day has clearly timed items with integer SAR cost estimates.',
              'Improve the titles, overview, highlights, tips, and activity names so the itinerary feels ready for a real travel site.',
            ].join('\n'),
      input: [
        {
          role: 'user',
          content: [
            locale === 'ar' ? 'تفاصيل الطلب:' : 'Planning brief:',
            JSON.stringify(
              {
                city: dto.city?.trim() || copy.unknownCity,
                days: dto.days,
                people: dto.people,
                minBudget: dto.minBudget ?? null,
                maxBudget: dto.maxBudget ?? null,
                style: dto.style?.trim() || 'all',
                prefs: this.normalizePrefs(dto.prefs),
                notes: dto.notes?.trim() || '',
                locale,
              },
              null,
              2,
            ),
            locale === 'ar' ? 'المسودة الحالية:' : 'Current draft plan:',
            JSON.stringify(draftPlan, null, 2),
          ].join('\n\n'),
        },
      ],
      schemaName: 'rahhal_trip_plan',
      schema: this.buildTripPlanSchema(),
      maxOutputTokens: 2600,
      temperature: 0.45,
    });

    const aiPlan = this.readPlan(payload as Prisma.JsonValue);
    return this.mergePlanWithFallback(aiPlan, draftPlan);
  }

  private async patchPlannerPlanWithOpenAi(
    message: string,
    plan: AiTripPlan,
    locale: SupportedLocale,
    history: SessionMessageRecord[],
  ) {
    const copy = AI_COPY[locale];
    const recentHistory = this.mapHistoryToOpenAiInput(history).slice(-6);
    const historyText =
      recentHistory.length > 0
        ? recentHistory
            .map((item) =>
              item.role === 'assistant'
                ? `${locale === 'ar' ? 'المساعد' : 'Assistant'}: ${item.content}`
                : `${locale === 'ar' ? 'المستخدم' : 'User'}: ${item.content}`,
            )
            .join('\n')
        : locale === 'ar'
          ? 'لا يوجد سجل سابق.'
          : 'No prior chat history.';

    const payload =
      await this.requestOpenAiStructuredResponse<PlannerPatchPayload>({
        instructions:
          locale === 'ar'
            ? [
                'أنت مساعد يراجع جداول السفر ويعدّلها داخل تطبيق رحّال.',
                'عدّل الجدول الحالي حسب طلب المستخدم فقط، وحافظ على بنية JSON المطلوبة بالكامل.',
                'الرد النصي يجب أن يكون قصيرًا وواضحًا ويشرح ما الذي تغير.',
                'الخطة النهائية يجب أن تبقى منظمة، واقعية، ومناسبة للعرض في واجهة موقع سفر.',
              ].join('\n')
            : [
                'You revise travel itineraries inside the Rahhal travel app.',
                'Update the current plan based only on the user request while keeping the required JSON structure complete.',
                'The reply text should be short and clearly describe what changed.',
                'The final plan should stay polished, realistic, and suitable for a travel website UI.',
              ].join('\n'),
        input: [
          {
            role: 'user',
            content: [
              locale === 'ar' ? 'سجل المحادثة الأخير:' : 'Recent chat history:',
              historyText,
              locale === 'ar' ? 'الخطة الحالية:' : 'Current plan:',
              JSON.stringify(plan, null, 2),
              locale === 'ar' ? 'طلب المستخدم الجديد:' : 'Latest user request:',
              message,
            ].join('\n\n'),
          },
        ],
        schemaName: 'rahhal_plan_patch',
        schema: this.buildPlannerPatchSchema(),
        maxOutputTokens: 2800,
        temperature: 0.4,
      });

    const nextPlan = this.mergePlanWithFallback(
      this.readPlan(payload.plan as Prisma.JsonValue),
      plan,
    );

    return {
      reply: payload.reply?.trim() || copy.plannerReplies.default,
      patchedPlan: nextPlan,
    };
  }

  private async generateAssistantReplyWithOpenAi(
    message: string,
    locale: SupportedLocale,
    history: SessionMessageRecord[],
  ): Promise<AssistantReplyResult> {
    const copy = AI_COPY[locale];
    const destinations = await this.prisma.destinations.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
      select: {
        name: true,
        region: true,
        description: true,
      },
      take: 30,
    });

    const payload =
      await this.requestOpenAiStructuredResponse<AssistantModelPayload>({
        instructions:
          locale === 'ar'
            ? [
                'أنت مساعد سفر شامل داخل تطبيق رحّال، وتساعد المستخدم في المقارنات والترشيحات والنقاش الحر عن الوجهات والمطاعم والمقاهي والأحياء والأجواء وتخطيط الرحلات.',
                'أجب بالعربية الطبيعية، وبأسلوب احترافي مناسب لموقع سفر حقيقي.',
                'قدّم إجابات عملية ومباشرة حتى لو كان السؤال عن مطاعم أو أحياء أو اقتراحات عامة، ولا تقل إن الشيء غير محدد إلا إذا كانت الرسالة فعلًا غامضة جدًا.',
                'إذا ذكر المستخدم أو أوصيت بوجهة موجودة في الكتالوج، فاكتب اسمها المطابق تمامًا داخل primaryDestinationName. وإذا لم توجد وجهة رئيسية من الكتالوج فأعد سلسلة فارغة.',
                'اكتب داخل contextLabel تسمية قصيرة مفيدة لسياق المحادثة، مثل: مكة، مطاعم مكة، مقاهي جدة، أحياء الرياض، رحلة عائلية. إذا لم يوجد سياق واضح فأعد سلسلة فارغة.',
                'إذا سأل المستخدم عن معلومات متغيرة جدًا مثل ساعات العمل الحالية أو أفضل مطعم الآن، أعطه ترشيحًا عامًا واذكر باختصار ضرورة التحقق من التقييمات أو المواعيد الحالية.',
                'قدّم إجابات عملية، قصيرة نسبيًا، وواضحة. استخدم نقاطًا قصيرة عند المقارنة إذا كان ذلك مفيدًا.',
                destinations.length > 0
                  ? `كتالوج الوجهات المتاحة:\n${this.formatDestinationCatalog(destinations, locale)}`
                  : 'لا يوجد كتالوج وجهات متاح حاليًا، لذا أجب بشكل عام وبشكل مفيد.',
              ].join('\n')
            : [
                'You are a broad travel assistant inside the Rahhal app and help users with destinations, restaurants, cafes, neighborhoods, travel mood, and trip planning.',
                'Reply in natural English with a polished tone suitable for a real travel website.',
                'Give practical answers even when the question is about restaurants, neighborhoods, or general travel choices. Do not say something is unspecified unless the user message is truly too vague.',
                'If the user mentions or you recommend a destination from the catalog, set primaryDestinationName to the exact catalog name. Otherwise return an empty string.',
                'Set contextLabel to a short useful chat label such as Makkah, Restaurants in Makkah, Cafes in Jeddah, Riyadh neighborhoods, or Family trip. If there is no clear label, return an empty string.',
                'If the user asks for highly time-sensitive details like current opening hours or the best place right now, give general guidance and briefly tell them to verify current ratings or hours.',
                'Keep answers practical, fairly concise, and easy to act on. Use short bullets for comparisons when helpful.',
                destinations.length > 0
                  ? `Available destination catalog:\n${this.formatDestinationCatalog(destinations, locale)}`
                  : 'No curated destination catalog is available right now, so answer generally but still helpfully.',
              ].join('\n'),
        input: [
          ...this.mapHistoryToOpenAiInput(history).slice(-8),
          {
            role: 'user',
            content: message,
          },
        ],
        schemaName: 'rahhal_assistant_reply',
        schema: this.buildAssistantReplySchema(),
        maxOutputTokens: 900,
        temperature: 0.7,
      });

    return {
      reply:
        payload.reply?.trim() ||
        `${copy.assistantReplies.noExactMatch}\n${copy.assistantReplies.askClarify}`,
      primaryDestination: this.findDestinationByName(
        destinations,
        payload.primaryDestinationName,
      ),
      contextLabel:
        payload.contextLabel?.trim() ||
        this.extractAssistantContextLabel(message, locale),
    };
  }

  private buildTripPlanSchema() {
    return {
      type: 'object',
      additionalProperties: false,
      properties: {
        city: { type: 'string' },
        days: { type: 'integer' },
        budgetLabel: { type: 'string' },
        tripTitle: { type: 'string' },
        overview: { type: 'string' },
        estimatedTotal: { type: 'integer' },
        styleLabel: { type: 'string' },
        audienceLabel: { type: 'string' },
        highlights: {
          type: 'array',
          items: { type: 'string' },
        },
        tips: {
          type: 'array',
          items: { type: 'string' },
        },
        daysPlan: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              day: { type: 'integer' },
              title: { type: 'string' },
              subtitle: { type: 'string' },
              estimatedTotal: { type: 'integer' },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    time: { type: 'string' },
                    name: { type: 'string' },
                    estimatedCost: { type: 'integer' },
                    note: { type: 'string' },
                    tag: { type: 'string' },
                  },
                  required: ['time', 'name', 'estimatedCost', 'note'],
                },
              },
            },
            required: ['day', 'title', 'items'],
          },
        },
      },
      required: [
        'city',
        'days',
        'budgetLabel',
        'tripTitle',
        'overview',
        'styleLabel',
        'audienceLabel',
        'highlights',
        'tips',
        'daysPlan',
      ],
    };
  }

  private buildPlannerPatchSchema() {
    return {
      type: 'object',
      additionalProperties: false,
      properties: {
        reply: { type: 'string' },
        plan: this.buildTripPlanSchema(),
      },
      required: ['reply', 'plan'],
    };
  }

  private buildAssistantReplySchema() {
    return {
      type: 'object',
      additionalProperties: false,
      properties: {
        reply: { type: 'string' },
        primaryDestinationName: { type: 'string' },
        contextLabel: { type: 'string' },
      },
      required: ['reply', 'primaryDestinationName', 'contextLabel'],
    };
  }

  private mergePlanWithFallback(aiPlan: AiTripPlan, fallbackPlan: AiTripPlan) {
    const daysPlan = fallbackPlan.daysPlan.map((fallbackDay, index) => {
      const aiDay = aiPlan.daysPlan[index];
      const nextItems =
        Array.isArray(aiDay?.items) && aiDay.items.length > 0
          ? aiDay.items
          : fallbackDay.items;

      return {
        ...fallbackDay,
        title: aiDay?.title?.trim() || fallbackDay.title,
        subtitle: aiDay?.subtitle?.trim() || fallbackDay.subtitle,
        items: nextItems,
      };
    });

    return this.recalculatePlan({
      ...fallbackPlan,
      city: aiPlan.city?.trim() || fallbackPlan.city,
      tripTitle: aiPlan.tripTitle?.trim() || fallbackPlan.tripTitle,
      overview: aiPlan.overview?.trim() || fallbackPlan.overview,
      budgetLabel: aiPlan.budgetLabel?.trim() || fallbackPlan.budgetLabel,
      styleLabel: aiPlan.styleLabel?.trim() || fallbackPlan.styleLabel,
      audienceLabel: aiPlan.audienceLabel?.trim() || fallbackPlan.audienceLabel,
      highlights: this.pickBestStringList(
        aiPlan.highlights,
        fallbackPlan.highlights,
        5,
      ),
      tips: this.pickBestStringList(aiPlan.tips, fallbackPlan.tips, 4),
      daysPlan,
    });
  }

  private pickBestStringList(
    primary: string[],
    fallback: string[],
    limit: number,
  ) {
    const normalizedPrimary = Array.isArray(primary)
      ? primary.map((item) => item.trim()).filter(Boolean)
      : [];

    if (normalizedPrimary.length > 0) {
      return normalizedPrimary.slice(0, limit);
    }

    return fallback.slice(0, limit);
  }

  private mapHistoryToOpenAiInput(
    history: SessionMessageRecord[],
  ): OpenAiInputMessage[] {
    return history
      .filter((item) => item?.text?.trim())
      .map((item) => ({
        role:
          item.role === ai_trip_message_role.assistant ? 'assistant' : 'user',
        content: item.text.trim(),
      }));
  }

  private formatDestinationCatalog(
    destinations: DestinationSummary[],
    locale: SupportedLocale,
  ) {
    const copy = AI_COPY[locale];
    return destinations
      .map((destination) => {
        const region =
          copy.regionLabels[
            destination.region as keyof typeof copy.regionLabels
          ] ?? destination.region;
        const description = destination.description
          ?.replace(/\s+/g, ' ')
          .trim();
        return `- ${destination.name} | ${region} | ${description?.slice(0, 140) ?? ''}`;
      })
      .join('\n');
  }

  private findDestinationByName(
    destinations: DestinationSummary[],
    name?: string | null,
  ) {
    const normalizedName = name?.trim();
    if (!normalizedName) {
      return null;
    }

    const needle = this.normalizeText(normalizedName);
    return (
      destinations.find((destination) => {
        const candidate = this.normalizeText(destination.name);
        return (
          candidate === needle ||
          candidate.includes(needle) ||
          needle.includes(candidate)
        );
      }) ?? null
    );
  }

  private async requestOpenAiStructuredResponse<T>({
    instructions,
    input,
    schemaName,
    schema,
    maxOutputTokens,
    temperature,
  }: {
    instructions: string;
    input: OpenAiInputMessage[];
    schemaName: string;
    schema: Record<string, unknown>;
    maxOutputTokens: number;
    temperature: number;
  }): Promise<T> {
    const apiKey = this.config.get<string>('OPENAI_API_KEY')?.trim();
    if (!apiKey) {
      throw new Error('OpenAI API key is missing.');
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.getOpenAiModel(),
        instructions,
        input,
        temperature,
        max_output_tokens: maxOutputTokens,
        store: false,
        text: {
          format: {
            type: 'json_schema',
            name: schemaName,
            schema,
            strict: true,
          },
        },
      }),
    });

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        this.readOpenAiErrorMessage(payload) ||
          `OpenAI request failed with status ${response.status}.`,
      );
    }

    const outputText = this.extractOpenAiOutputText(payload);
    if (!outputText) {
      throw new Error('OpenAI returned an empty response.');
    }

    try {
      return JSON.parse(outputText) as T;
    } catch {
      throw new Error('OpenAI returned invalid JSON.');
    }
  }

  private extractOpenAiOutputText(payload: unknown) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return '';
    }

    const output = (payload as { output?: unknown }).output;
    if (!Array.isArray(output)) {
      return '';
    }

    const texts = output.flatMap((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return [];
      }

      const content = (item as { content?: unknown }).content;
      if (!Array.isArray(content)) {
        return [];
      }

      return content.flatMap((contentItem) => {
        if (
          !contentItem ||
          typeof contentItem !== 'object' ||
          Array.isArray(contentItem)
        ) {
          return [];
        }

        const candidate = contentItem as {
          type?: string;
          text?: string;
          refusal?: string;
        };

        if (
          candidate.type === 'output_text' &&
          typeof candidate.text === 'string'
        ) {
          return [candidate.text];
        }

        if (typeof candidate.refusal === 'string') {
          return [candidate.refusal];
        }

        return [];
      });
    });

    return texts.join('\n').trim();
  }

  private readOpenAiErrorMessage(payload: unknown) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return null;
    }

    const error = (payload as { error?: unknown }).error;
    if (error && typeof error === 'object' && !Array.isArray(error)) {
      const message = (error as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim()) {
        return message.trim();
      }
    }

    const message = (payload as { message?: unknown }).message;
    return typeof message === 'string' && message.trim()
      ? message.trim()
      : null;
  }

  private logAiServiceFallback(context: string, error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown AI service error.';
    const stack = error instanceof Error ? error.stack : undefined;
    this.logger.warn(`OpenAI failed during ${context}. Falling back locally.`);
    this.logger.error(message, stack);
  }

  private async patchPlannerPlan(
    message: string,
    plan: AiTripPlan,
    locale: SupportedLocale,
    history: SessionMessageRecord[] = [],
  ) {
    if (!this.hasOpenAiApiKey()) {
      return this.patchPlannerPlanFallback(message, plan, locale);
    }

    try {
      return await this.patchPlannerPlanWithOpenAi(
        message,
        plan,
        locale,
        history,
      );
    } catch (error) {
      this.logAiServiceFallback('planner patch', error);
      return this.patchPlannerPlanFallback(message, plan, locale);
    }
  }

  private patchPlannerPlanFallback(
    message: string,
    plan: AiTripPlan,
    locale: SupportedLocale,
  ) {
    const copy = AI_COPY[locale];
    const msg = message.toLowerCase();
    const patched = structuredClone(plan);

    const scaleCosts = (factor: number) => {
      patched.daysPlan = patched.daysPlan.map((day) => ({
        ...day,
        items: day.items.map((item) => ({
          ...item,
          estimatedCost: Math.max(
            0,
            Math.round((item.estimatedCost || 0) * factor),
          ),
        })),
      }));
    };

    const addItemToEachDay = (item: PlanItem) => {
      patched.daysPlan = patched.daysPlan.map((day) => ({
        ...day,
        items: [...day.items, item],
      }));
    };

    const hasAny = (terms: string[]) =>
      terms.some((term) => msg.includes(term));

    let reply: string = copy.plannerReplies.default;

    if (
      hasAny([
        'أرخص',
        'ارخص',
        'قلل',
        'اقتصادي',
        'cheap',
        'cheaper',
        'lower',
        'reduce',
        'budget',
      ])
    ) {
      scaleCosts(0.8);
      reply = copy.plannerReplies.cheaper;
    }

    if (hasAny(['طبيعة', 'nature', 'outdoor', 'scenic', 'views'])) {
      addItemToEachDay({
        time: '16:30',
        tag: copy.timeTags.extra,
        name:
          locale === 'ar' ? 'توقف طبيعي / نقطة مطل' : 'Nature stop / viewpoint',
        estimatedCost: 0,
        note:
          locale === 'ar'
            ? 'إضافة خفيفة تفتح مجال للتصوير والراحة'
            : 'A light addition for views, photos, and a breather',
      });
      reply = copy.plannerReplies.nature;
    }

    if (hasAny(['مطاعم', 'أكل', 'اكل', 'food', 'restaurant', 'restaurants'])) {
      addItemToEachDay({
        time: '20:00',
        tag: copy.timeTags.night,
        name:
          locale === 'ar' ? 'اقتراح عشاء واضح' : 'Clear dinner recommendation',
        estimatedCost: 90,
        note:
          locale === 'ar'
            ? 'يمكن تخصيصه حسب الذوق والميزانية'
            : 'Can be tailored to taste and budget',
      });
      reply = copy.plannerReplies.restaurants;
    }

    if (hasAny(['تسوق', 'shopping', 'mall', 'market'])) {
      addItemToEachDay({
        time: '18:30',
        tag: copy.timeTags.extra,
        name: locale === 'ar' ? 'نافذة تسوق مرنة' : 'Flexible shopping window',
        estimatedCost: 0,
        note:
          locale === 'ar'
            ? 'مدة قصيرة لا تكسر توازن اليوم'
            : 'A short slot that keeps the day balanced',
      });
      reply = copy.plannerReplies.shopping;
    }

    if (hasAny(['عائلية', 'عائلة', 'family'])) {
      patched.audienceLabel =
        locale === 'ar' ? 'عائلة / رفقة خفيفة' : 'Family / light company';
      patched.daysPlan = patched.daysPlan.map((day) => ({
        ...day,
        title: locale === 'ar' ? 'برنامج عائلي' : 'Family-friendly plan',
      }));
      reply = copy.plannerReplies.family;
    }

    if (hasAny(['اليوم الثاني', 'اليوم 2', 'day 2', 'day two', 'second day'])) {
      const day2 = patched.daysPlan.find((day) => day.day === 2);
      if (day2) {
        day2.title = locale === 'ar' ? 'يوم أخف' : 'Lighter day';
        day2.items = day2.items.slice(0, 3);
        reply = copy.plannerReplies.day2;
      }
    }

    return {
      reply,
      patchedPlan: this.recalculatePlan(patched),
    };
  }

  private async generateAssistantReply(
    message: string,
    locale: SupportedLocale,
    history: SessionMessageRecord[] = [],
  ): Promise<AssistantReplyResult> {
    if (!this.hasOpenAiApiKey()) {
      return this.generateAssistantReplyFallback(message, locale);
    }

    try {
      return await this.generateAssistantReplyWithOpenAi(
        message,
        locale,
        history,
      );
    } catch (error) {
      this.logAiServiceFallback('assistant reply', error);
      return this.generateAssistantReplyFallback(message, locale);
    }
  }

  private async generateAssistantReplyFallback(
    message: string,
    locale: SupportedLocale,
  ): Promise<AssistantReplyResult> {
    const copy = AI_COPY[locale];
    const normalized = this.normalizeText(message);
    const contextLabel = this.extractAssistantContextLabel(message, locale);
    const destinations = await this.prisma.destinations.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
      select: {
        name: true,
        region: true,
        description: true,
      },
      take: 12,
    });

    const matched = destinations.filter((destination) =>
      normalized.includes(this.normalizeText(destination.name)),
    );

    const wantsCompare = this.containsAny(normalized, [
      'قارن',
      'compare',
      'فرق',
      'difference',
      'between',
      'بين',
    ]);
    const wantsRecommendations = this.containsAny(normalized, [
      'اقترح',
      'رشح',
      'suggest',
      'recommend',
      'وين أروح',
      'where should i go',
      'weekend',
      'ويكند',
    ]);
    const wantsFamily = this.containsAny(normalized, [
      'عائلة',
      'عائلية',
      'family',
      'kids',
    ]);
    const wantsBudget = this.containsAny(normalized, [
      'اقتصادي',
      'أرخص',
      'budget',
      'cheap',
    ]);
    const wantsSea = this.containsAny(normalized, ['بحر', 'sea', 'coast']);
    const wantsNature = this.containsAny(normalized, [
      'طبيعة',
      'جبال',
      'nature',
      'mountain',
    ]);

    if (wantsCompare && matched.length >= 2) {
      const [first, second] = matched;
      const reply = [
        copy.assistantReplies.compareIntro,
        '',
        `1. ${first.name}: ${this.describeDestination(first, locale, {
          wantsFamily,
          wantsBudget,
        })}`,
        `2. ${second.name}: ${this.describeDestination(second, locale, {
          wantsFamily,
          wantsBudget,
        })}`,
        '',
        copy.assistantReplies.followUp,
      ].join('\n');

      return {
        reply,
        primaryDestination: first,
        contextLabel: contextLabel || first.name,
      };
    }

    if (matched.length >= 1) {
      const destination = matched[0];
      const reply = [
        locale === 'ar'
          ? `إذا كنت تفكر في ${destination.name}:`
          : `If you are considering ${destination.name}:`,
        `- ${this.describeDestination(destination, locale, {
          wantsFamily,
          wantsBudget,
        })}`,
        `- ${this.suggestTripLength(destination, wantsNature || wantsSea, locale)}`,
        `- ${copy.assistantReplies.followUp}`,
      ].join('\n');

      return {
        reply,
        primaryDestination: destination,
        contextLabel: contextLabel || destination.name,
      };
    }

    if (wantsRecommendations) {
      const suggestions = this.pickDestinationSuggestions(destinations, {
        wantsFamily,
        wantsBudget,
        wantsSea,
        wantsNature,
      });
      const reply = [
        copy.assistantReplies.recommendationIntro,
        '',
        ...suggestions.map(
          (destination, index) =>
            `${index + 1}. ${destination.name}: ${this.describeDestination(
              destination,
              locale,
              { wantsFamily, wantsBudget },
            )}`,
        ),
        '',
        copy.assistantReplies.askClarify,
      ].join('\n');

      return {
        reply,
        primaryDestination: suggestions[0] ?? null,
        contextLabel: contextLabel || suggestions[0]?.name || null,
      };
    }

    if (contextLabel) {
      return {
        reply:
          locale === 'ar'
            ? `أقدر أساعدك في ${contextLabel}. إذا تبي ترشيحات أدق، قل لي هل تبحث عن شيء اقتصادي، مشهور، جلسة هادئة، أو مناسب للعائلة.`
            : `I can help with ${contextLabel}. If you want sharper recommendations, tell me whether you want budget-friendly, popular, calm, or family-friendly options.`,
        primaryDestination: null,
        contextLabel,
      };
    }

    return {
      reply: `${copy.assistantReplies.noExactMatch}\n${copy.assistantReplies.askClarify}`,
      primaryDestination: null,
      contextLabel: null,
    };
  }

  private describeDestination(
    destination: DestinationSummary,
    locale: SupportedLocale,
    options: { wantsFamily: boolean; wantsBudget: boolean },
  ) {
    const copy = AI_COPY[locale];
    const region =
      copy.regionLabels[destination.region as keyof typeof copy.regionLabels] ??
      destination.region;
    const description = destination.description?.trim();
    const trimmedDescription = description
      ? description.replace(/\s+/g, ' ').slice(0, 120)
      : locale === 'ar'
        ? `وجهة موجودة في ${region}`
        : `A destination in the ${region}`;

    const suffixes: string[] = [];
    if (options.wantsFamily) {
      suffixes.push(
        locale === 'ar'
          ? 'مناسبة أكثر للطلعات الهادئة والعائلية'
          : 'better for calm, family-friendly plans',
      );
    }
    if (options.wantsBudget) {
      suffixes.push(
        locale === 'ar'
          ? 'وتحتاج موازنة بسيطة في الأنشطة المدفوعة'
          : 'and works best with a light eye on paid activities',
      );
    }

    return [trimmedDescription, ...suffixes].filter(Boolean).join('، ');
  }

  private suggestTripLength(
    destination: DestinationSummary,
    scenicBias: boolean,
    locale: SupportedLocale,
  ) {
    return scenicBias || /العلا|أبها|alula|abha/i.test(destination.name)
      ? locale === 'ar'
        ? 'أنسب مدة مبدئية لها 3 إلى 4 أيام.'
        : 'A good initial duration is 3 to 4 days.'
      : locale === 'ar'
        ? 'ممكن تبدأ معها بويكند من يومين إلى 3 أيام.'
        : 'You can start with a 2- to 3-day weekend.';
  }

  private pickDestinationSuggestions(
    destinations: DestinationSummary[],
    hints: {
      wantsFamily: boolean;
      wantsBudget: boolean;
      wantsSea: boolean;
      wantsNature: boolean;
    },
  ) {
    const filtered = destinations.filter((destination) => {
      const haystack = this.normalizeText(
        `${destination.name} ${destination.description ?? ''}`,
      );

      if (
        hints.wantsSea &&
        !this.containsAny(haystack, ['بحر', 'sea', 'coast', 'كورنيش'])
      ) {
        return false;
      }

      if (
        hints.wantsNature &&
        !this.containsAny(haystack, [
          'طبيعة',
          'جبل',
          'nature',
          'mountain',
          'وادي',
        ])
      ) {
        return false;
      }

      return true;
    });

    const source = filtered.length > 0 ? filtered : destinations;
    return source.slice(0, 3);
  }

  private containsAny(text: string, terms: string[]) {
    return terms.some((term) => text.includes(term));
  }

  private extractAssistantContextLabel(
    message: string,
    locale: SupportedLocale,
  ) {
    const trimmed = message.replace(/\s+/g, ' ').trim();
    if (!trimmed) {
      return null;
    }

    const topicPatterns =
      locale === 'ar'
        ? [
            /(مطاعم\s+[^\s?.!,،]+)/,
            /(مقاهي\s+[^\s?.!,،]+)/,
            /(كافيهات\s+[^\s?.!,،]+)/,
            /(فنادق\s+[^\s?.!,،]+)/,
            /(أحياء\s+[^\s?.!,،]+)/,
            /(اسواق\s+[^\s?.!,،]+)/,
            /(أسواق\s+[^\s?.!,،]+)/,
          ]
        : [
            /(restaurants in [a-zA-Z\s-]+)/i,
            /(cafes in [a-zA-Z\s-]+)/i,
            /(hotels in [a-zA-Z\s-]+)/i,
            /(neighborhoods in [a-zA-Z\s-]+)/i,
          ];

    for (const pattern of topicPatterns) {
      const match = trimmed.match(pattern);
      if (match?.[1]) {
        return this.cleanAssistantContextLabel(match[1]);
      }
    }

    const locationMatch =
      locale === 'ar'
        ? trimmed.match(
            /(?:في|ب|عن|داخل|حول|قرب)\s+([ء-يA-Za-z][ء-يA-Za-z\s-]{1,30})/u,
          )
        : trimmed.match(
            /(?:in|about|around|near)\s+([a-zA-Z][a-zA-Z\s-]{1,30})/i,
          );

    if (locationMatch?.[1]) {
      return this.cleanAssistantContextLabel(locationMatch[1]);
    }

    const shortText = this.cleanAssistantContextLabel(trimmed);
    if (shortText.split(' ').length <= 4 && shortText.length <= 28) {
      return shortText;
    }

    return null;
  }

  private cleanAssistantContextLabel(value: string) {
    return value
      .replace(/[?.!,،]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 40);
  }

  private normalizeText(value: string) {
    return value.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  private async findDestinationByCity(city: string) {
    if (
      !city ||
      city === AI_COPY.ar.unknownCity ||
      city === AI_COPY.en.unknownCity
    ) {
      return null;
    }

    return this.prisma.destinations.findFirst({
      where: {
        is_active: true,
        OR: [{ name: { equals: city } }, { name: { contains: city } }],
      },
      select: {
        name: true,
        region: true,
        description: true,
      },
    });
  }

  private readPlan(value: Prisma.JsonValue): AiTripPlan {
    const fallback = this.buildAssistantPlaceholderPlan(
      'ar',
      AI_COPY.ar.unknownCity,
    );

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return fallback;
    }

    const plan = value;
    const daysPlanValue = Array.isArray(plan.daysPlan) ? plan.daysPlan : [];

    const parsedDaysPlan = daysPlanValue
      .map((dayValue, index) => {
        if (
          !dayValue ||
          typeof dayValue !== 'object' ||
          Array.isArray(dayValue)
        ) {
          return null;
        }

        const day = dayValue;
        const itemsValue = Array.isArray(day.items) ? day.items : [];
        const parsedItems = itemsValue
          .map((itemValue) => {
            if (
              !itemValue ||
              typeof itemValue !== 'object' ||
              Array.isArray(itemValue)
            ) {
              return null;
            }

            const item = itemValue;
            return {
              time: typeof item.time === 'string' ? item.time : '00:00',
              name: typeof item.name === 'string' ? item.name : '',
              estimatedCost:
                typeof item.estimatedCost === 'number' ? item.estimatedCost : 0,
              note: typeof item.note === 'string' ? item.note : '',
              tag: typeof item.tag === 'string' ? item.tag : undefined,
            };
          })
          .filter(Boolean) as PlanItem[];

        return {
          day: typeof day.day === 'number' && day.day > 0 ? day.day : index + 1,
          title:
            typeof day.title === 'string'
              ? day.title
              : index === 0
                ? fallback.tripTitle
                : `Day ${index + 1}`,
          subtitle: typeof day.subtitle === 'string' ? day.subtitle : undefined,
          estimatedTotal:
            typeof day.estimatedTotal === 'number' ? day.estimatedTotal : 0,
          items: parsedItems,
        };
      })
      .filter(Boolean) as DayPlan[];

    return this.recalculatePlan({
      city:
        typeof plan.city === 'string' && plan.city.trim()
          ? plan.city
          : fallback.city,
      days:
        typeof plan.days === 'number' && plan.days > 0
          ? plan.days
          : fallback.days,
      budgetLabel:
        typeof plan.budgetLabel === 'string'
          ? plan.budgetLabel
          : fallback.budgetLabel,
      tripTitle:
        typeof plan.tripTitle === 'string'
          ? plan.tripTitle
          : fallback.tripTitle,
      overview:
        typeof plan.overview === 'string' ? plan.overview : fallback.overview,
      estimatedTotal:
        typeof plan.estimatedTotal === 'number'
          ? plan.estimatedTotal
          : fallback.estimatedTotal,
      styleLabel:
        typeof plan.styleLabel === 'string'
          ? plan.styleLabel
          : fallback.styleLabel,
      audienceLabel:
        typeof plan.audienceLabel === 'string'
          ? plan.audienceLabel
          : fallback.audienceLabel,
      highlights: Array.isArray(plan.highlights)
        ? plan.highlights.filter(
            (item): item is string => typeof item === 'string',
          )
        : [],
      tips: Array.isArray(plan.tips)
        ? plan.tips.filter((item): item is string => typeof item === 'string')
        : [],
      daysPlan: parsedDaysPlan,
    });
  }

  private mapSessionSummary(session: SessionSummaryRecord) {
    const latestMessage = session.ai_trip_messages[0];
    const mode = this.getSessionMode(session.style);

    return {
      id: session.id.toString(),
      mode,
      title: session.title,
      city: session.city,
      days: session.days,
      createdAt: session.created_at,
      updatedAt: session.updated_at ?? session.created_at,
      lastMessageAt:
        session.last_message_at ??
        latestMessage?.created_at ??
        session.created_at,
      lastMessagePreview: latestMessage?.text ?? null,
    };
  }

  private mapSessionDetail(session: SessionDetailRecord) {
    const mode = this.getSessionMode(session.style);

    return {
      id: session.id.toString(),
      mode,
      title: session.title,
      locale: session.locale,
      createdAt: session.created_at,
      updatedAt: session.updated_at ?? session.created_at,
      form: {
        city: mode === 'assistant' ? '' : session.city,
        days: session.days,
        minBudget: session.min_budget ? session.min_budget.toString() : '',
        maxBudget: session.max_budget ? session.max_budget.toString() : '',
        people: session.people,
        style: mode === 'assistant' ? 'all' : (session.style ?? 'all'),
        prefs: Array.isArray(session.prefs) ? session.prefs : [],
        notes: session.notes ?? '',
      },
      plan: this.readPlan(session.plan_json),
      messages: session.ai_trip_messages.map((message) => ({
        id: message.id.toString(),
        role: message.role,
        text: message.text,
        createdAt: message.created_at,
      })),
    };
  }
}
