import { Grid } from "./Grid"

export enum EPlayer {
   Me = "Me",
   Opp = "Opp",
}

export interface Turn {
   player: {
      [EPlayer.Me]: PlayerState
      [EPlayer.Opp]: PlayerState
   }
   board: Board
}

export interface PlayerState {
   matter: number
   recyclers: number
   bots: number   
}

export class Board extends Grid<Cell> {

}

export interface Cell {
   scrap: number
   owner: EPlayer | null
   units: number
   recycler: boolean
   inRangeOfRecycler: boolean
   canBuild: boolean
   canSpawn: boolean
}