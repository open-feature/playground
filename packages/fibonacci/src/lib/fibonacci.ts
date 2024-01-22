import { OpenFeature } from '@openfeature/nestjs-sdk';

const oFeatClient = OpenFeature.getClient('fibonacci');

export async function fibonacci(num: number): Promise<number> {
  const value = await oFeatClient.getStringValue('fib-algo', 'recursive');

  switch (value) {
    case 'recursive':
      return getNthFibRecursive(num);
    case 'memo':
      return getNthFibRecursiveMemo(num);
    case 'loop':
      return getNthFibLoop(num);
    case 'binet':
      return getNthFibBinet(num);
    default:
      return getNthFibRecursive(num);
  }
}

export async function getNthFibRecursive(num: number): Promise<number> {
  // on very fast systems, recursive is faster than we want for the demo... so we add an artificial linear delay, based on n.
  const minTimePromise = new Promise((resolve) => setTimeout(resolve, Math.floor((num / 10) * 1000)));

  const [result] = await Promise.all([getNthFibRecursiveSync(num), minTimePromise]);
  return result;
}

function getNthFibRecursiveSync(num: number): number {
  if (num === 2) {
    return 1;
  } else if (num === 1) {
    return 0;
  } else {
    return getNthFibRecursiveSync(num - 1) + getNthFibRecursiveSync(num - 2);
  }
}

type Cache = { [num: number]: number };

export function getNthFibRecursiveMemo(num: number, memo: Cache = { 1: 0, 2: 1 }): number {
  return getNthFibRecursiveMemoSync(num, memo);
}

function getNthFibRecursiveMemoSync(num: number, memo: Cache = { 1: 0, 2: 1 }): number {
  if (num in memo) {
    return memo[num];
  } else {
    memo[num] = getNthFibRecursiveMemoSync(num - 1, memo) + getNthFibRecursiveMemoSync(num - 2, memo);
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
    (Math.pow((1 + Math.sqrt(5)) / 2, num - 1) - Math.pow((1 - Math.sqrt(5)) / 2, num - 1)) / Math.sqrt(5)
  );
}
