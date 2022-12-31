import { Grid, GridIdx } from "./Grid"
import { deserializeBoolean, deserializeNumber, serializeBoolean, serializeNumber } from "./Tools"
import { deflateSync, inflateSync } from "node:zlib"


export interface GameState {
   turn: number
   player: [PlayerState, PlayerState]
   board: Board
}

export module GameState {

   export function clone(state: GameState): GameState {
      return {
         turn: state.turn,
         player: [{ ...state.player[0] }, { ...state.player[1] }],
         board: state.board.clone(),
      }
   }

   export function serializeCompressed(state: GameState): string {
      return deflateSync(GameState.serialize(state)).toString("base64")
   }

   export function deserializeCompressed(sCompressed: string): GameState {
      return GameState.deserialize(inflateSync(Buffer.from(sCompressed, "base64")).toString(), [0])
   }

   export function serialize(state: GameState): string {
      return serializeNumber(state.turn)
             + PlayerState.serialize(state.player[0])
             + PlayerState.serialize(state.player[1])
             + state.board.serializeBoard()
   }

   export function deserialize(s: string, pos: [number]): GameState {
      const turn = deserializeNumber(s, pos)
      const player0 = PlayerState.deserialize(s, pos)
      const player1 = PlayerState.deserialize(s, pos)
      const board = Board.deserializeBoard(s, pos)
      return { turn, player: [player0, player1], board }
   }
}

export type Owner = Player | null

export type Player = typeof MY_PLAYER | typeof OPP_PLAYER
export const MY_PLAYER = 0
export const OPP_PLAYER = 1

export module Player {
   export function opponent(player: Player): Player {
      return player === 0 ? 1 : 0
   }
}

export interface PlayerState {
   matter: number
   recyclers: number
   bots: number
}

export module PlayerState {

   export function serialize(state: PlayerState): string {
      const matterStr = serializeNumber(state.matter)
      const recyclersStr = serializeNumber(state.recyclers)
      const botsStr = serializeNumber(state.bots)
      return matterStr + recyclersStr + botsStr
   }

   export function deserialize(s: string, pos: [number]): PlayerState {
      const matter = deserializeNumber(s, pos)
      const recyclers = deserializeNumber(s, pos)
      const bots = deserializeNumber(s, pos)
      return { matter, recyclers, bots }
   }
}

export class Board extends Grid<Cell> {

   clone(): Board {
      return new Board(this.width, this.height, idx => ({ ...this.cell(idx) }))
   }

   iterateRecyclers(handleRecycler: (idx: GridIdx) => void) {
      return this.iterate((cell, idx) => {
         if (cell.recycler) {
            handleRecycler(idx)
         }
      })
   }

   serializeBoard(): string {
      return super.serialize(Cell.serialize)
   }

   static deserializeBoard(s: string, pos: [number]): Board {
      return Grid.deserialize(
         s,
         pos,
         (width, height) => new Board(width, height, null),
         Cell.deserialize)
   }
}

export interface Cell {
   scrap: number
   owner: Owner
   units: number
   recycler: boolean
   inRangeOfRecycler: boolean
   canBuild: boolean
   canSpawn: boolean
}

export module Cell {

   export function isPath(cell: Cell): boolean {
      return !cell.recycler && cell.scrap > 0
   }

   export function equals(c0: Cell, c1: Cell): boolean {
      return c0?.scrap === c1?.scrap
             && c0?.owner === c1?.owner
             && c0?.units === c1?.units
             && c0?.recycler === c1?.recycler
             && c0?.inRangeOfRecycler === c1?.inRangeOfRecycler
             && c0?.canBuild === c1?.canBuild
             && c0?.canSpawn === c1?.canSpawn
   }

   export function serialize(cell: Cell): string {
      return serializeNumber(cell.scrap)
             + (cell.owner === null ? "n" : cell.owner)
             + serializeNumber(cell.units)
             + serializeBoolean(cell.recycler)
             + serializeBoolean(cell.inRangeOfRecycler)
             + serializeBoolean(cell.canBuild)
             + serializeBoolean(cell.canSpawn)
   }

   export function deserialize(s: string, pos: [number]): Cell {

      const scrap = deserializeNumber(s, pos)
      const ownerStr = s[pos[0]]
      pos[0]++
      const owner = (ownerStr === "n" ? null : parseInt(ownerStr) as Owner)
      const units = deserializeNumber(s, pos)
      const recycler = deserializeBoolean(s, pos)
      const inRangeOfRecycler = deserializeBoolean(s, pos)
      const canBuild = deserializeBoolean(s, pos)
      const canSpawn = deserializeBoolean(s, pos)

      return {
         scrap,
         owner,
         units,
         recycler,
         inRangeOfRecycler,
         canBuild,
         canSpawn,
      }
   }
}
