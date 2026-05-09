function getParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const values = Object.fromEntries(
    formatter.formatToParts(date).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]),
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function zonedDateTimeToUtc(year: number, month: number, day: number, hour: number, minute: number, second: number, timeZone: string) {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const parts = getParts(utcGuess, timeZone);
  const asIfUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const desired = Date.UTC(year, month - 1, day, hour, minute, second);
  return new Date(utcGuess.getTime() - (asIfUtc - desired));
}

export function computeNextDailyRun(scheduleTime: string, timeZone: string, from = new Date()) {
  const [hourRaw, minuteRaw] = scheduleTime.split(':');
  const hour = Number(hourRaw || '9');
  const minute = Number(minuteRaw || '0');

  const nowParts = getParts(from, timeZone);
  let target = zonedDateTimeToUtc(nowParts.year, nowParts.month, nowParts.day, hour, minute, 0, timeZone);

  if (target.getTime() <= from.getTime()) {
    const tomorrowUtc = new Date(Date.UTC(nowParts.year, nowParts.month - 1, nowParts.day + 1, 12, 0, 0));
    const tomorrowParts = getParts(tomorrowUtc, timeZone);
    target = zonedDateTimeToUtc(tomorrowParts.year, tomorrowParts.month, tomorrowParts.day, hour, minute, 0, timeZone);
  }

  return target;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function stripHtml(input: string) {
  return input.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
