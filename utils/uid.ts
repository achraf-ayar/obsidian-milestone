// Unique ID Generator

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
