﻿import { Board, Cell, GameState, Owner, PlayerState } from "./GameState"

export function readGameState(width: number, height: number, turn: number): GameState {

   const inputs = readline().split(" ")

   const board = readBoard(width, height)

   return {
      turn,
      player: [0, 1].map(player => ({
         matter: parseInt(inputs[player]),
         recyclers: board.sum(cell => cell.owner === player && cell.recycler ? 1 : 0),
         bots: board.sum(cell => cell.owner === player ? cell.units : 0),
      })) as [PlayerState, PlayerState],
      board,
   }
}

function readBoard(width: number, height: number): Board {

   const board = new Board(width, height, null)

   for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
         board.setCell({ x, y }, readCell())
      }
   }

   return board
}

function readCell(): Cell {
   const [scrap, owner, units, recycler, canBuild, canSpawn, inRangeOfRecycler] = readline().split(" ")
   return {
      scrap: parseInt(scrap),
      owner: parseOwner(owner),
      units: parseInt(units),
      recycler: recycler === "1",
      inRangeOfRecycler: inRangeOfRecycler === "1",
      canBuild: canBuild === "1",
      canSpawn: canSpawn === "1",
   }
}

function parseOwner(input: string): Owner {
   let parsedOwner = parseInt(input) as -1 | 0 | 1
   return parsedOwner === -1 ? null : 1 - parsedOwner as Owner
}