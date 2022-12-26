export class PriorityQueue<T> {

   private readonly _heap: { priority: number, element: T }[] = []
   private size = 0

   isEmpty(): boolean {
      return this.size === 0
   }

   peek(): T {
      return this._heap[0].element
   }

   push(element: T, priority: number): number {
      if (this._heap.length > this.size) {
         this._heap[this.size] = { priority, element }
      } else {
         this._heap.push({ priority, element })
      }
      this.size++
      this.heapUp()
      return this.size
   }

   pop(): T {
      const poppedValue = this.peek()
      this.size--
      this.swap(0, this.size)
      this.heapDown()
      return poppedValue
   }

   reset() {
      this.size = 0
   }

   private heapUp() {
      let node = this.size - 1
      while (node > 0 && this.less(node, PriorityQueue.parent(node))) {
         this.swap(node, PriorityQueue.parent(node))
         node = PriorityQueue.parent(node)
      }
   }

   private heapDown() {
      let node = 0
      while (
         (PriorityQueue.left(node) < this.size && this.less(PriorityQueue.left(node), node)) ||
         (PriorityQueue.right(node) < this.size && this.less(PriorityQueue.right(node), node))
         ) {
         let maxChild = (PriorityQueue.right(node) <
                         this.size &&
                         this.less(PriorityQueue.right(node), PriorityQueue.left(node)))
                        ? PriorityQueue.right(node)
                        : PriorityQueue.left(node)
         this.swap(node, maxChild)
         node = maxChild
      }
   }

   private swap(i: number, j: number) {
      const tmp = this._heap[i]
      this._heap[i] = this._heap[j]
      this._heap[j] = tmp
   }

   private less(i: number, j: number) {
      return this._heap[i].priority < this._heap[j].priority
   }

   private static parent(i: number) {
      return ((i + 1) >>> 1) - 1
   }

   private static left(i: number) {
      return (i << 1) + 1
   }

   private static right(i: number) {
      return (i + 1) << 1
   }
}