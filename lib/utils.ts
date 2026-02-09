export function generateTimeSlots(
  dates: string[],
  timeStart: number,
  timeEnd: number
): { date: string; time: string; datetime: string }[] {
  const slots: { date: string; time: string; datetime: string }[] = [];

  for (const date of dates) {
    for (let hour = timeStart; hour < timeEnd; hour++) {
      for (const minute of [0, 30]) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          date,
          time: timeStr,
          datetime: `${date}T${timeStr}`,
        });
      }
    }
  }

  return slots;
}

export function formatTime(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}${period}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function getDateRange(startDate: Date, endDate: Date): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
