export class Queue<TQueueItem> {

   private _dataIn: TQueueItem[] = []
   private _dataInIdx: number = -1
   private _dataOut: TQueueItem[] = []
   private _dataOutIdx: number = -1

   enqueue(queueItem: TQueueItem) {
      this._dataInIdx++
      if (this._dataInIdx < this._dataIn.length) {
         this._dataIn[this._dataInIdx] = queueItem
      } else {
         this._dataIn.push(queueItem)
      }
   }

   dequeue(): TQueueItem {
      if (this._dataOutIdx < 0) {
         const dataTmp = this._dataOut
         this._dataOut = this._dataIn
         this._dataOutIdx = this._dataInIdx
         this._dataIn = dataTmp
         this._dataInIdx = -1
      }
      if (this._dataOutIdx < 0) {
         throw new Error("cannot dequeue empty queue")
      }
      const queueItem = this._dataOut[this._dataOutIdx]
      this._dataOutIdx--
      return queueItem
   }

   isEmpty(): boolean {
      return this._dataOutIdx < 0 && this._dataInIdx < 0
   }

   reset(): void {
      this._dataInIdx = -1
      this._dataOutIdx = -1
   }
}
