export class PriorityQueue<T> {

  private readonly _heap: { priority: number, element: T }[] = [];
  public size = 0;

  isEmpty(): boolean {
    return this.size === 0;
  }

  peek(): T {
    return this._heap[0].element;
  }

  push(element: T, priority: number): number {
    if (this._heap.length > this.size) {
      this._heap[this.size] = { priority, element };
    } else {
      this._heap.push({ priority, element });
    }
    this.size++;
    this.heapUp();
    return this.size;
  }

  pop(): T {
    const poppedValue = this.peek();
    this.size--;
    this.swap(0, this.size);
    this.heapDown();
    return poppedValue;
  }

  private heapUp() {
    let node = this.size - 1;
    while (node > 0 && this.less(node, this.parent(node))) {
      this.swap(node, this.parent(node));
      node = this.parent(node);
    }
  }

  private heapDown() {
    let node = 0;
    while (
      (this.left(node) < this.size && this.less(this.left(node), node)) ||
      (this.right(node) < this.size && this.less(this.right(node), node))
    ) {
      let maxChild = (this.right(node) < this.size && this.less(this.right(node), this.left(node))) ? this.right(node) : this.left(node);
      this.swap(node, maxChild);
      node = maxChild;
    }
  }

  private swap(i: number, j: number) {
    const tmp = this._heap[i];
    this._heap[i] = this._heap[j];
    this._heap[j] = tmp;
  }

  private less(i: number, j: number) {
    return this._heap[i].priority < this._heap[j].priority;
  }

  private parent(i: number) {
    return ((i + 1) >>> 1) - 1;
  }

  private left(i: number) {
    return (i << 1) + 1;
  }

  private right(i: number) {
    return (i + 1) << 1;
  }
}