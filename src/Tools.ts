export function orderBy<T>(array: T[], selector: (element: T) => number): T[] {
   return array.sort((a, b) => selector(a) - selector(b))
}