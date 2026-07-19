export type ClassValue = string | number | false | null | undefined

/** Join truthy class name values with a single space. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
