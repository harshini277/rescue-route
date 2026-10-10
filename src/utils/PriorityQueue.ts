/**
 * Binary Min-Heap Priority Queue implementation for Dijkstra & A* Pathfinding.
 * 
 * Time Complexity:
 * - Insert (push): O(log N)
 * - Extract Minimum (pop): O(log N)
 * - Decrease Key / Update Priority: O(log N)
 * - Peek Minimum: O(1)
 * 
 * Space Complexity: O(N) where N is the number of vertices in the heap.
 */
export interface PQElement<T> {
  element: T;
  priority: number;
}

export class PriorityQueue<T> {
  private heap: PQElement<T>[] = [];
  private itemIndexMap: Map<T, number> = new Map();

  constructor() {}

  /**
   * Insert element with given priority. If element already exists with higher priority, updates it.
   */
  public push(element: T, priority: number): void {
    if (this.itemIndexMap.has(element)) {
      const idx = this.itemIndexMap.get(element)!;
      if (priority < this.heap[idx].priority) {
        this.heap[idx].priority = priority;
        this.bubbleUp(idx);
      }
      return;
    }

    const newNode: PQElement<T> = { element, priority };
    this.heap.push(newNode);
    const index = this.heap.length - 1;
    this.itemIndexMap.set(element, index);
    this.bubbleUp(index);
  }

  /**
   * Removes and returns the element with the lowest priority value.
   */
  public pop(): T | undefined {
    if (this.isEmpty()) return undefined;

    const min = this.heap[0];
    const end = this.heap.pop()!;
    this.itemIndexMap.delete(min.element);

    if (this.heap.length > 0) {
      this.heap[0] = end;
      this.itemIndexMap.set(end.element, 0);
      this.sinkDown(0);
    }

    return min.element;
  }

  public peek(): PQElement<T> | undefined {
    return this.heap[0];
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public size(): number {
    return this.heap.length;
  }

  public contains(element: T): boolean {
    return this.itemIndexMap.has(element);
  }

  public getPriority(element: T): number | undefined {
    const idx = this.itemIndexMap.get(element);
    if (idx === undefined) return undefined;
    return this.heap[idx].priority;
  }

  public toArray(): T[] {
    return this.heap.map((item) => item.element);
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      if (this.heap[index].priority >= this.heap[parentIdx].priority) break;

      this.swap(index, parentIdx);
      index = parentIdx;
    }
  }

  private sinkDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      const leftChildIdx = 2 * index + 1;
      const rightChildIdx = 2 * index + 2;
      let smallest = index;

      if (
        leftChildIdx < length &&
        this.heap[leftChildIdx].priority < this.heap[smallest].priority
      ) {
        smallest = leftChildIdx;
      }

      if (
        rightChildIdx < length &&
        this.heap[rightChildIdx].priority < this.heap[smallest].priority
      ) {
        smallest = rightChildIdx;
      }

      if (smallest === index) break;

      this.swap(index, smallest);
      index = smallest;
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;

    this.itemIndexMap.set(this.heap[i].element, i);
    this.itemIndexMap.set(this.heap[j].element, j);
  }
}
