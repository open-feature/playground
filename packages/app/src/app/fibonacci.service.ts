import { Inject, Injectable } from '@nestjs/common';
import { Client } from '@openfeature/openfeature-js';
import { OPENFEATURE } from './constants';

type Cache = { [num: number]: number };

@Injectable()
export class FibonacciService {

  constructor(@Inject(OPENFEATURE) private openfeatureClient: Client) {}

  async fibonacci(num: number): Promise<number> {
    const value = await this.openfeatureClient.getStringValue('fib-algo', 'recursive');
    /**
     * TODO: See if variations should return OTel methods that allow developers to
     * define logs, metrics, and events related to the flag. It could be useful
     * here to determine the impact the algorithm has on performance.
     */
    switch (value) {
      case 'recursive':
        console.log('Running the recursive fibonacci function');
        return this.getNthFibRecursive(num);
      case 'memo':
        console.log('Running the memo fibonacci function');
        return this.getNthFibRecursiveMemo(num);
      case 'loop':
        console.log('Running the looping fibonacci function');
        return this.getNthFibLoop(num);
      case 'binet':
        console.log('Running the binet fibonacci function');
        return this.getNthFibBinet(num);
      default:
        console.log('Running the default recursive fibonacci function');
        return this.getNthFibRecursive(num);
    }
  }
  
  private getNthFibRecursive(num: number): number {
    if (num === 2) {
      return 1;
    } else if (num === 1) {
      return 0;
    } else {
      return this.getNthFibRecursive(num - 1) + this.getNthFibRecursive(num - 2);
    }
  }
  
  
  private getNthFibRecursiveMemo(
    num: number,
    memo: Cache = { 1: 0, 2: 1 }
  ): number {
    if (num in memo) {
      return memo[num];
    } else {
      memo[num] =
        this.getNthFibRecursiveMemo(num - 1, memo) +
        this.getNthFibRecursiveMemo(num - 2, memo);
      return memo[num];
    }
  }
  
  private getNthFibLoop(num: number): number {
    const previousTwoNum: [number, number] = [0, 1];
    let counter = 3;
    while (counter <= num) {
      const nextNum = previousTwoNum[0] + previousTwoNum[1];
      previousTwoNum[0] = previousTwoNum[1];
      previousTwoNum[1] = nextNum;
      counter++;
    }
    return num > 1 ? previousTwoNum[1] : previousTwoNum[0];
  }
  
  private getNthFibBinet(num: number): number {
    return Math.round(
      (Math.pow((1 + Math.sqrt(5)) / 2, num - 1) -
        Math.pow((1 - Math.sqrt(5)) / 2, num - 1)) /
        Math.sqrt(5)
    );
  }
}
