export function orderBy<T>(array: T[], selector: (element: T) => number): T[] {
   return [...array].sort((a, b) => selector(a) - selector(b))
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
   return s.charAt(0).toUpperCase() + s.slice(1) as Capitalize<T>;
}