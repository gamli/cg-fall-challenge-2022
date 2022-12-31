import { Grid } from "./Grid"

describe("Grid", () => {

   describe("constructor", () => {

      it("takes a default cell", () => {
         const grid = new Grid(5, 5, 42)
         grid.iterate(cell => expect(cell).toBe(42))
      })

      it("the default cell is the same object in every cell", () => {
         const defaultCell = {}
         const grid = new Grid(5, 5, defaultCell)
         grid.iterate(cell => expect(cell).toBe(defaultCell))
      })

      it("the default cell can also be a function that is invoked for each cell", function () {         
         const grid = new Grid(5, 5, idx => ({ idx }))
         grid.iterate((cell, idx) => expect(cell).toEqual({ idx }))
      })
   })
   
   
})