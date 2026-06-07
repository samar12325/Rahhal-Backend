import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AiTripsService } from './ai-trips.service';
import { GenerateAiTripDto } from './dto/generate-ai-trip.dto';

type SupportedLocale = 'ar' | 'en';

type DestinationRecord = {
  name: string;
  region: string;
  description: string | null;
};

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

type PlannerPlan = {
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

type PlannerPatchResult = {
  reply: string;
  patchedPlan: PlannerPlan;
};

type AssistantReplyResult = {
  reply: string;
  primaryDestination: DestinationRecord | null;
  contextLabel: string | null;
};

type SessionMessageRecord = {
  role: string;
  text: string;
};

function getPrivateMethod<Args extends unknown[], Result>(
  service: object,
  methodName: string,
) {
  const candidate = Reflect.get(service, methodName) as unknown;

  if (typeof candidate !== 'function') {
    throw new Error(`${methodName} is not available on the service instance.`);
  }

  return candidate.bind(service) as (...args: Args) => Result;
}

function setPrivateMethod<Args extends unknown[], Result>(
  service: object,
  methodName: string,
  implementation: (...args: Args) => Result,
) {
  Object.defineProperty(service, methodName, {
    value: implementation,
    configurable: true,
    writable: true,
  });
}

describe('AiTripsService', () => {
  const openAiKey = 'test-openai-key-that-is-long-enough';
  const destinationCatalog: DestinationRecord[] = [
    {
      name: 'Jeddah',
      region: 'west',
      description: 'Sea-facing city with a busy waterfront and dining spots.',
    },
    {
      name: 'Abha',
      region: 'south',
      description: 'Mountain weather, parks, and scenic viewpoints.',
    },
  ];

  const createService = () => {
    const prismaMock = {
      destinations: {
        findFirst: jest
          .fn<Promise<DestinationRecord | null>, [unknown?]>()
          .mockResolvedValue(null),
        findMany: jest
          .fn<Promise<DestinationRecord[]>, [unknown?]>()
          .mockResolvedValue(destinationCatalog),
      },
    };

    const configMock = {
      get: jest.fn((key: string) => {
        if (key === 'OPENAI_API_KEY') return openAiKey;
        if (key === 'OPENAI_MODEL') return 'gpt-4.1-mini';
        return undefined;
      }),
    };

    const service = new AiTripsService(
      prismaMock as unknown as PrismaService,
      configMock as unknown as ConfigService,
    );

    const logFallbackSpy = jest.fn<void, [string, unknown]>();
    setPrivateMethod<[string, unknown], void>(
      service,
      'logAiServiceFallback',
      logFallbackSpy,
    );

    return { service, logFallbackSpy };
  };

  it('returns the local planner draft when OpenAI itinerary enhancement fails', async () => {
    const { service, logFallbackSpy } = createService();
    const dto: GenerateAiTripDto = {
      city: 'Riyadh',
      days: 3,
      people: 2,
      style: 'culture',
      prefs: ['history'],
      notes: '',
      locale: 'en',
    };

    const buildPlannerPlanFallback = getPrivateMethod<
      [GenerateAiTripDto, SupportedLocale],
      Promise<PlannerPlan>
    >(service, 'buildPlannerPlanFallback');
    const buildPlannerPlan = getPrivateMethod<
      [GenerateAiTripDto, SupportedLocale],
      Promise<PlannerPlan>
    >(service, 'buildPlannerPlan');

    const expectedPlan = await buildPlannerPlanFallback(dto, 'en');

    setPrivateMethod<
      [GenerateAiTripDto, SupportedLocale, PlannerPlan],
      Promise<PlannerPlan>
    >(
      service,
      'enhancePlannerPlanWithOpenAi',
      jest.fn().mockRejectedValue(new Error('OpenAI unavailable')),
    );

    const plan = await buildPlannerPlan(dto, 'en');

    expect(plan).toEqual(expectedPlan);
    expect(logFallbackSpy).toHaveBeenCalledWith(
      'planner generation',
      expect.any(Error),
    );
  });

  it('falls back to the local plan patcher when OpenAI patching fails', async () => {
    const { service, logFallbackSpy } = createService();
    const buildPlannerPlanFallback = getPrivateMethod<
      [GenerateAiTripDto, SupportedLocale],
      Promise<PlannerPlan>
    >(service, 'buildPlannerPlanFallback');
    const patchPlannerPlanFallback = getPrivateMethod<
      [string, PlannerPlan, SupportedLocale],
      PlannerPatchResult
    >(service, 'patchPlannerPlanFallback');
    const patchPlannerPlan = getPrivateMethod<
      [string, PlannerPlan, SupportedLocale, SessionMessageRecord[]?],
      Promise<PlannerPatchResult>
    >(service, 'patchPlannerPlan');

    const plan = await buildPlannerPlanFallback(
      {
        city: 'Jeddah',
        days: 2,
        people: 2,
        style: 'all',
        prefs: [],
        notes: '',
        locale: 'en',
      },
      'en',
    );
    const message = 'make it cheaper';
    const expected = patchPlannerPlanFallback(message, plan, 'en');

    setPrivateMethod<
      [string, PlannerPlan, SupportedLocale, SessionMessageRecord[]],
      Promise<PlannerPatchResult>
    >(
      service,
      'patchPlannerPlanWithOpenAi',
      jest.fn().mockRejectedValue(new Error('OpenAI unavailable')),
    );

    const patched = await patchPlannerPlan(message, plan, 'en', []);

    expect(patched).toEqual(expected);
    expect(logFallbackSpy).toHaveBeenCalledWith(
      'planner patch',
      expect.any(Error),
    );
  });

  it('falls back to the local assistant reply when OpenAI chat fails', async () => {
    const { service, logFallbackSpy } = createService();
    const message = 'suggest a family trip by the sea';
    const generateAssistantReplyFallback = getPrivateMethod<
      [string, SupportedLocale],
      Promise<AssistantReplyResult>
    >(service, 'generateAssistantReplyFallback');
    const generateAssistantReply = getPrivateMethod<
      [string, SupportedLocale, SessionMessageRecord[]?],
      Promise<AssistantReplyResult>
    >(service, 'generateAssistantReply');

    const expected = await generateAssistantReplyFallback(message, 'en');

    setPrivateMethod<
      [string, SupportedLocale, SessionMessageRecord[]],
      Promise<AssistantReplyResult>
    >(
      service,
      'generateAssistantReplyWithOpenAi',
      jest.fn().mockRejectedValue(new Error('OpenAI unavailable')),
    );

    const reply = await generateAssistantReply(message, 'en', []);

    expect(reply).toEqual(expected);
    expect(logFallbackSpy).toHaveBeenCalledWith(
      'assistant reply',
      expect.any(Error),
    );
  });
});
