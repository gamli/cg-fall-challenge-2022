import { GridIdx } from "./Grid"

export type Action = MoveAction | BuildAction | SpawnAction | WaitAction

export interface MoveAction extends ActionBase {
   type: EAction.Move
   amount: number
   from: GridIdx
   to: GridIdx
}

export const moveAction = (amount: number, from: GridIdx, to: GridIdx): MoveAction => ({
   type: EAction.Move,
   amount,
   from,
   to,
})

export interface BuildAction extends ActionBase {
   type: EAction.Build
   pos: GridIdx
}

export const buildAction = (pos: GridIdx): BuildAction => ({
   type: EAction.Build,
   pos,
})

export interface SpawnAction extends ActionBase {
   type: EAction.Spawn
   amount: number
   pos: GridIdx
}

export const spawnAction = (amount: number, pos: GridIdx): SpawnAction => ({
   type: EAction.Spawn,
   amount,
   pos,
})

export interface WaitAction extends ActionBase {
   type: EAction.Wait
}

export const waitAction = (): WaitAction => ({
   type: EAction.Wait,
})

export interface ActionBase {
   type: EAction
}

export enum EAction {
   Move = "MOVE",
   Build = "BUILD",
   Spawn = "SPAWN",
   Wait = "WAIT",
}

export const BUILD_COSTS = 10
export const SPAWN_COSTS = 10

export type InferAction<TEAction extends EAction> =
   TEAction extends EAction.Move ? MoveAction :
   TEAction extends EAction.Build ? BuildAction :
   TEAction extends EAction.Spawn ? SpawnAction :
   WaitAction
