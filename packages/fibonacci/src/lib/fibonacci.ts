import { openfeature } from '@openfeature/openfeature-js';

const oFeatClient = openfeature.getClient('fibonacci');

export async function fibonacci(num: number): Promise<number> {
  const value = await oFeatClient.getStringValue('fib-algo', 'recursive');
  /**
   * TODO: See if variations should return OTel methods that allow developers to
   * define logs, metrics, and events related to the flag. It could be useful
   * here to determine the impact the algorithm has on performance.
   */
  switch (value) {
    case 'recursive':
      console.log('Running the recursive fibonacci function');
      return getNthFibRecursive(num);
    case 'memo':
      console.log('Running the memo fibonacci function');
      return getNthFibRecursiveMemo(num);
    case 'loop':
      console.log('Running the looping fibonacci function');
      return getNthFibLoop(num);
    case 'binet':
      console.log('Running the binet fibonacci function');
      return getNthFibBinet(num);
    default:
      console.log('Running the default recursive fibonacci function');
      return getNthFibRecursive(num);
  }
}

export function getNthFibRecursive(num: number): number {
  if (num === 2) {
    return 1;
  } else if (num === 1) {
    return 0;
  } else {
    return getNthFibRecursive(num - 1) + getNthFibRecursive(num - 2);
  }
}

type Cache = { [num: number]: number };

export function getNthFibRecursiveMemo(
  num: number,
  memo: Cache = { 1: 0, 2: 1 }
): number {
  if (num in memo) {
    return memo[num];
  } else {
    memo[num] =
      getNthFibRecursiveMemo(num - 1, memo) +
      getNthFibRecursiveMemo(num - 2, memo);
    return memo[num];
  }
}

export function getNthFibLoop(num: number): number {
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

export function getNthFibBinet(num: number): number {
  return Math.round(
    (Math.pow((1 + Math.sqrt(5)) / 2, num - 1) -
      Math.pow((1 - Math.sqrt(5)) / 2, num - 1)) /
      Math.sqrt(5)
  );
}
