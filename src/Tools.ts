import * as util from "util"

export function orderBy<T>(array: T[], selector: (element: T) => number): T[] {
   return [...array].sort((a, b) => selector(a) - selector(b))
}

export function partition<T>(array: T[], size: number): T[][] {
   if (array.length === 0) {
      return []
   }
   return array.reduce(
      (partitions, element) => {
         const lastPartition = partitions[partitions.length - 1]
         if (lastPartition.length === size) {
            partitions.push([])
         }
         partitions[partitions.length - 1].push(element)
         return partitions
      },
      [[] as T[]])
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

export function toStringDeep(value: unknown, options?: { showHidden?: true, depth?: number, colors?: false }) {
   return util.inspect(
      value,
      {
         showHidden: !!options?.showHidden,
         depth: options?.depth || Infinity,
         maxArrayLength: Infinity,
         maxStringLength: Infinity,
         breakLength: Infinity,
         colors: options?.colors !== false,
      })
}

export function serializeNumber(n: number): string {
   return n.toString() + ";"
}

export function deserializeNumber(s: string, pos: [number]): number {
   const semicolonIdx = s.indexOf(";", pos[0])
   if (semicolonIdx === -1) {
      throw new Error("no serialized number found (no semicolon found)")
   }
   const n = parseInt(s.substring(pos[0], semicolonIdx))
   if (Number.isNaN(n)) {
      throw new Error(`The string "${s.substring(Math.max(0, pos[0]), semicolonIdx + 1)}" is not a number`)
   }
   pos[0] = semicolonIdx + 1
   return n
}

export function serializeBoolean(b: boolean): string {
   return b ? "1" : "0"
}

export function deserializeBoolean(s: string, pos: [number]): boolean {   
   const b = s[pos[0]] === "1"
   pos[0] = pos[0] + 1
   return b
}

export const identityFn = <T>(x: T) => x 