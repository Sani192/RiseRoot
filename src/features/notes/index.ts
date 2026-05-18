import type { FeatureBoundary, ISODateString } from "@/types";

export interface DailyNote {
  date: ISODateString;
  body: string;
  updatedAt: string;
}

export interface DailyNoteStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const dailyNotesStorageKey = "riseroot:daily-notes";

function toISODateString(date: Date): ISODateString {
  return date.toISOString().slice(0, 10);
}

function getBrowserStorage(): DailyNoteStorage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

function readNotes(
  storage: DailyNoteStorage | null = getBrowserStorage(),
): DailyNote[] {
  const storedNotes = storage?.getItem(dailyNotesStorageKey);

  if (!storedNotes) {
    return [];
  }

  let parsedNotes: unknown;

  try {
    parsedNotes = JSON.parse(storedNotes);
  } catch {
    return [];
  }

  if (!Array.isArray(parsedNotes)) {
    return [];
  }

  return parsedNotes.filter((note): note is DailyNote => {
    if (typeof note !== "object" || note === null) {
      return false;
    }

    const candidate = note as Record<string, unknown>;

    return (
      typeof candidate.date === "string" &&
      typeof candidate.body === "string" &&
      typeof candidate.updatedAt === "string"
    );
  });
}

function writeNotes(
  notes: readonly DailyNote[],
  storage: DailyNoteStorage | null,
): void {
  storage?.setItem(dailyNotesStorageKey, JSON.stringify(notes));
}

export function getDailyNote(
  date: Date = new Date(),
  storage: DailyNoteStorage | null = getBrowserStorage(),
): DailyNote | null {
  const dateKey = toISODateString(date);

  return readNotes(storage).find((note) => note.date === dateKey) ?? null;
}

export function saveDailyNote(
  body: string,
  date: Date = new Date(),
  storage: DailyNoteStorage | null = getBrowserStorage(),
): DailyNote {
  const note: DailyNote = {
    date: toISODateString(date),
    body,
    updatedAt: new Date().toISOString(),
  };
  const nextNotes = readNotes(storage).filter(
    (currentNote) => currentNote.date !== note.date,
  );
  nextNotes.push(note);
  writeNotes(
    nextNotes.sort((left, right) => left.date.localeCompare(right.date)),
    storage,
  );

  return note;
}

export function deleteDailyNote(
  date: Date = new Date(),
  storage: DailyNoteStorage | null = getBrowserStorage(),
): void {
  const dateKey = toISODateString(date);
  const nextNotes = readNotes(storage).filter((note) => note.date !== dateKey);

  if (nextNotes.length === 0) {
    storage?.removeItem(dailyNotesStorageKey);
    return;
  }

  writeNotes(nextNotes, storage);
}

export const notesFeature: FeatureBoundary = {
  name: "Notes",
  phase: "phase-1",
  status: "ready",
};
