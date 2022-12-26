export function orderBy<T>(array: T[], selector: (element: T) => number): T[] {
   return [...array].sort((a, b) => selector(a) - selector(b))
}

export function arrayMax<T>(array: T[], selector: (element: T) => number) {
   return array.reduce((previousValue, currentValue) => Math.max(previousValue, selector(currentValue)), -Infinity)
}

export function prefix<T extends object, TPrefix extends string>(o: T, prefix: TPrefix): Prefixed<T, TPrefix> {
   const prefixed = {} as Prefixed<T, TPrefix>
   for (const key in o) {
      prefixed[prefix + capitalize(key) as keyof Prefixed<T, TPrefix>] = o[key] as any
   }
   return prefixed
}

export type Prefixed<T extends object, TPrefix extends string> =
   { [key in keyof T & string as `${TPrefix}${Capitalize<key>}`]: T[key] }

function capitalize<T extends string>(s: T): Capitalize<T> {
   return s.charAt(0).toUpperCase() + s.slice(1) as Capitalize<T>
}

export function memoize<TArgs extends unknown[], TReturn>(
   fn: (...args: TArgs) => TReturn,
   computeKey: (...args: TArgs) => string,
) {
   const cache = {} as { [key: string]: TReturn }
   return (...args: TArgs): TReturn => {
      const key = computeKey(...args)
      if (!cache[key]) {
         cache[key] = fn(...args)
      }
      return cache[key]
   }
}

export function padRight(s: string, minLength: number): string {
   if (s.length >= minLength) {
      return s  
   }
   return s + " ".repeat(minLength - s.length)
}