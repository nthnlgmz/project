// Text and logic for the "next booth" banner (components/BoothBanner.js).
//
// Placeholders are filled in automatically from the booth and shown in bold:
//   {venue}  venue name          {city}   city
//   {dates}  e.g. "Nov 14-15"    {until}  last day, e.g. "Nov 15" (shows "tonight" on the last day)
//
// Add, remove or reword lines freely. One line is picked at random each time the page loads.
import Core from '../public/fundys-core.js';

// Shown BEFORE the booth starts
export const BEFORE = [
  'Come say hi at our next booth! Find us at {venue}, {city} on {dates}. See the jars up close and take home your favorite.',
  "We're coming to {city}! Visit our booth at {venue} on {dates} and meet the whole Fundy's family of spreads.",
  "Mark your calendar! Fundy's will be at {venue}, {city} on {dates}. Come say hello and pick your flavor.",
  'Our next stop is {city}! Drop by our booth at {venue} on {dates} and take home your favorite jar.',
  'See you soon! Find our booth at {venue} in {city} on {dates}. Come say hi and pick up a jar or two.',
  'Fresh jars, friendly faces. Catch us at {venue}, {city} on {dates}.',
  "Bring your pandesal! We'll be at {venue}, {city} on {dates}. Come stock up on your favorite spread.",
  'Planning your weekend? Stop by our booth at {venue} in {city} on {dates} and say hi!',
  'Your next favorite spread is coming to {city}. Find us at {venue} on {dates}.',
  "Next booth alert! Fundy's will be at {venue}, {city} on {dates}. We'd love to see you there.",
];

// Shown while the booth is happening (from its first day to its last day)
export const DURING = [
  "We're at {venue}, {city} right now! Drop by until {until} and say hi.",
  'Come find us! Our booth is open at {venue} in {city} until {until}.',
  "Fundy's is in {city} today! Visit our booth at {venue} and take home your favorite jar. We're here until {until}.",
  "We're here! Stop by our booth at {venue}, {city} and see the jars up close. Open until {until}.",
  "Come say hello! We're at {venue} in {city} until {until}.",
  'Booth is open! Visit us at {venue}, {city} until {until} and pick your favorite spread.',
  "Looking for Fundy's? We're at {venue} in {city} right now, until {until}.",
  "Happening now: Fundy's at {venue}, {city}. Come by before {until} and stock up.",
  'Walk on over! Our booth at {venue} in {city} is waiting for you until {until}.',
  "We're live at {venue}, {city}! Visit us until {until} and take your favorite spread home.",
];

// Finds the booth to promote (the one happening now, otherwise the next one) and works out the wording values.
// Returns null when no booth is lined up.
export function describeNextBooth(booths, today = Core.todayDate()) {
  const booth = Core.sortBooths(booths).find((b) => !Core.isPast(b, today));
  if (!booth) return null;

  const start = Core.parseDate(booth.start);
  const end = Core.parseDate(booth.end || booth.start);
  const phase = start && today >= start ? 'during' : 'before';
  const lastDay = end && today.getTime() === end.getTime();

  return {
    booth,
    phase,
    values: {
      venue: booth.name,
      city: booth.city,
      dates: Core.formatRange(booth.start, booth.end),
      until: lastDay ? 'tonight' : Core.formatRange(booth.end || booth.start, booth.end || booth.start),
    },
  };
}
