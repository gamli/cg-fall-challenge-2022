import { arrayMax, padRight } from "./Tools"

export class ColumnBuilder {

   private _columns = [] as string[][]

   constructor(private _columnSeparator: string, minColumns: number) {
      while (this._columns.length < minColumns) {
         this._columns.push([])
      }
   }

   push(text: string, column: number) {
      while (this._columns.length <= column) {
         this._columns.push([])
      }
      this._columns[column].push(text)
   }

   toString() {
      this.expandColumns()
      const maxColLines = arrayMax(this._columns, col => col.length)
      let str = ""
      for (let lineIdx = 0; lineIdx < maxColLines; lineIdx++) {
         let line = ""
         for (let colIdx = 0; colIdx < this._columns.length; colIdx++) {
            line += this._columns[colIdx][lineIdx]
            if (colIdx < this._columns.length - 1) {
               line += this._columnSeparator
            }
         }
         str += line + "\n"
      }
      return str
   }

   expandColumns() {
      const maxColumnHeight = arrayMax(this._columns, col => (col.length))
      for (let col = 0; col < this._columns.length; col++) {
         const columnWidth = arrayMax(this._columns[col], text => text.length)
         this.expandColumn(col, columnWidth, maxColumnHeight)
      }
   }

   expandColumn(column: number, width: number, height: number) {
      const col = this._columns[column]
      while (col.length < height) {
         col.push("")
      }
      for (let i = 0; i < col.length; i++) {
         col[i] = padRight(col[i], width)
      }
   }
}