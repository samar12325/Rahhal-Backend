const RIYADH_TIME_ZONE = 'Asia/Riyadh';

type BookingCompletionInput = {
  scheduledDate?: Date | null;
  scheduledTime?: string | null;
  tripStartDate?: Date | null;
  tripEndDate?: Date | null;
  now?: Date;
};

const getDateKey = (value?: Date | null) => {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
};

const getRiyadhClock = (value: Date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: RIYADH_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(value);

  const read = (type: string, fallback = '00') =>
    parts.find((part) => part.type === type)?.value ?? fallback;

  return {
    dateKey: `${read('year')}-${read('month')}-${read('day')}`,
    timeKey: `${read('hour')}:${read('minute')}`,
  };
};

const normalizeTimeKey = (value?: string | null) => {
  if (!value) return null;

  const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const isBookingCompletedByDate = ({
  scheduledDate,
  scheduledTime,
  tripStartDate,
  tripEndDate,
  now = new Date(),
}: BookingCompletionInput) => {
  const referenceDate =
    getDateKey(tripEndDate) ??
    getDateKey(scheduledDate) ??
    getDateKey(tripStartDate);
  if (!referenceDate) return false;

  const { dateKey: todayKey, timeKey: currentTimeKey } = getRiyadhClock(now);

  if (referenceDate < todayKey) return true;
  if (referenceDate > todayKey) return false;

  if (tripEndDate) {
    return false;
  }

  const bookingTimeKey = normalizeTimeKey(scheduledTime);
  if (!bookingTimeKey) return false;

  return bookingTimeKey <= currentTimeKey;
};
