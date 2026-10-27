import {
  normalizeRoomLines,
  ROOM_CAPACITY,
  type RoomCategory,
  type RoomLine,
} from "./simple-hotel-booking-storage";
import { formatRoomCategory, type GuestMealSelection } from "./hotel-pricing";

/** Hard ceiling: every room filled to capacity (2×2 + 2×2 + 4×4). */
export const MAX_GUESTS = 24;

function isRoomCategory(value: unknown): value is RoomCategory {
  return typeof value === "string" && Object.hasOwn(ROOM_CAPACITY, value);
}

/**
 * Room lines from `rooms: [{roomCategory, roomCount}]`, or the legacy single
 * `roomCategory` + `roomCount` fields. Returns an error message when invalid.
 */
export function parseRoomLines(body: Record<string, unknown>): RoomLine[] | string {
  let raw: unknown[];
  if (Array.isArray(body.rooms)) {
    raw = body.rooms;
  } else if (body.roomCategory !== undefined) {
    raw = [{ roomCategory: body.roomCategory, roomCount: body.roomCount }];
  } else {
    return "Please choose at least one room.";
  }
  if (raw.length === 0 || raw.length > 3) return "Please choose between one and three room types.";
  const lines: RoomLine[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) return "Invalid room selection.";
    const r = item as Record<string, unknown>;
    const category = typeof r.roomCategory === "string" ? r.roomCategory.trim() : r.roomCategory;
    const count = Number(r.roomCount);
    if (!isRoomCategory(category)) return "Please choose a valid room category.";
    if (!Number.isInteger(count) || count < 1) return "Number of rooms must be a whole number of at least 1.";
    lines.push({ roomCategory: category, roomCount: count });
  }
  const merged = normalizeRoomLines(lines);
  for (const line of merged) {
    const max = ROOM_CAPACITY[line.roomCategory];
    if (line.roomCount > max) {
      return `Number of ${formatRoomCategory(line.roomCategory)} rooms must be between 1 and ${max}.`;
    }
  }
  return merged;
}

/**
 * Per-guest meal selections. Must have exactly one entry per guest with a
 * unique guestIndex in [0, guests). Falls back to the legacy all-guest
 * meal flags when absent. Returns an error message when invalid.
 */
export function parseGuestMeals(
  body: Record<string, unknown>,
  guests: number,
): GuestMealSelection[] | string {
  if (body.guestMealSelections === undefined || body.guestMealSelections === null) {
    // An array here is a malformed per-guest payload, not the legacy flags object.
    if (Array.isArray(body.meals)) return "Invalid meal selections.";
    const m =
      typeof body.meals === "object" && body.meals !== null
        ? (body.meals as Record<string, unknown>)
        : {};
    const breakfast = m.includeBreakfast === true;
    const lunch = m.includeLunch === true;
    const dinner = m.includeDinner === true;
    return Array.from({ length: guests }, (_, guestIndex) => ({ guestIndex, breakfast, lunch, dinner }));
  }
  if (!Array.isArray(body.guestMealSelections)) return "Invalid meal selections.";
  const list = body.guestMealSelections;
  if (list.length !== guests) return "Please choose meals for each guest.";
  const seen = new Set<number>();
  const out: GuestMealSelection[] = [];
  for (const item of list) {
    if (typeof item !== "object" || item === null) return "Invalid meal selections.";
    const g = item as Record<string, unknown>;
    const idx = Number(g.guestIndex);
    if (!Number.isInteger(idx) || idx < 0 || idx >= guests || seen.has(idx)) {
      return "Invalid meal selections.";
    }
    seen.add(idx);
    out.push({ guestIndex: idx, breakfast: g.breakfast === true, lunch: g.lunch === true, dinner: g.dinner === true });
  }
  return out.sort((a, b) => a.guestIndex - b.guestIndex);
}

export function describeLines(lines: RoomLine[]): string {
  return lines.map((l) => `${formatRoomCategory(l.roomCategory)} ×${l.roomCount}`).join(", ");
}

