import { isBookingCompletedByDate } from './booking-completion';

describe('isBookingCompletedByDate', () => {
  it('marks a booking completed when the trip end date is before today in Riyadh', () => {
    expect(
      isBookingCompletedByDate({
        tripEndDate: new Date('2026-04-24T00:00:00.000Z'),
        now: new Date('2026-04-26T09:15:00.000Z'),
      }),
    ).toBe(true);
  });

  it('marks a same-day booking completed when its scheduled time has passed in Riyadh', () => {
    expect(
      isBookingCompletedByDate({
        scheduledDate: new Date('2026-04-26T00:00:00.000Z'),
        scheduledTime: '11:00',
        now: new Date('2026-04-26T09:15:00.000Z'),
      }),
    ).toBe(true);
  });

  it('keeps a same-day booking upcoming when its scheduled time is still ahead', () => {
    expect(
      isBookingCompletedByDate({
        scheduledDate: new Date('2026-04-26T00:00:00.000Z'),
        scheduledTime: '18:00',
        now: new Date('2026-04-26T09:15:00.000Z'),
      }),
    ).toBe(false);
  });

  it('keeps a trip upcoming for the rest of its final day when only end date is known', () => {
    expect(
      isBookingCompletedByDate({
        tripEndDate: new Date('2026-04-26T00:00:00.000Z'),
        now: new Date('2026-04-26T09:15:00.000Z'),
      }),
    ).toBe(false);
  });
});
