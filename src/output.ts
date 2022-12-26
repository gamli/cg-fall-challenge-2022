import { Action, EAction } from "./Action"
import { GridIdx } from "./Grid"

export function outputAction(action: Action): string {
   switch (action.type) {
      case EAction.Wait:
         return outputWait()
      case EAction.Move:
         return outputMove(action.amount, action.from, action.to)
      case EAction.Build:
         return outputBuild(action.pos)
      case EAction.Spawn:
         return outputSpawn(action.amount, action.pos)
   }
}

export function outputMove(amount: number, from: GridIdx, to: GridIdx) {
   return output(joinSpace(EAction.Move, amount, toStringGridIdx(from), toStringGridIdx(to)))
}

export function outputBuild(pos: GridIdx) {
   return output(joinSpace(EAction.Build, toStringGridIdx(pos)))
}

export function outputSpawn(amount: number, pos: GridIdx) {
   return output(joinSpace(EAction.Spawn, amount, toStringGridIdx(pos)))
}

export function outputWait() {
   return output(EAction.Wait)
}

export function outputMessage(message: string) {
   return output(joinSpace("MESSAGE", message))
}

export function toStringGridIdx(GridIdx: GridIdx): string {
   return joinSpace(GridIdx.x, GridIdx.y)
}

function output(what: any): string {
   return what + ";"
}

function joinSpace(...elements: any[]) {
   return join(" ", ...elements)
}

function join(separator: string, ...elements: any[]): string {
   return elements.join(separator)
}