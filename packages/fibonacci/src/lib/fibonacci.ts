import { OpenFeature } from '@openfeature/js-sdk';

const oFeatClient = OpenFeature.getClient('fibonacci');

export async function fibonacci(num: number): Promise<number> {
  const value = await oFeatClient.getStringValue('fib-algo', 'recursive');

  switch (value) {
    case 'recursive':
      console.log('Running the recursive fibonacci function');
      return await getNthFibRecursive(num);
    case 'memo':
      console.log('Running the memo fibonacci function');
      return await getNthFibRecursiveMemo(num);
    case 'loop':
      console.log('Running the looping fibonacci function');
      return await getNthFibLoop(num);
    case 'binet':
      console.log('Running the binet fibonacci function');
      return await getNthFibBinet(num);
    default:
      console.log('Running the default recursive fibonacci function');
      return await getNthFibRecursive(num);
  }
}

export async function getNthFibRecursive(num: number): Promise<number> {
  
  // on very fast systems, recursive is faster than we want for the demo... so we add an artificial linear delay, based on n.
  const minTimePromise = new Promise(resolve => setTimeout(resolve, Math.floor((num / 10) * 1000)));
  
  const [ result ] = await Promise.all([
    getNthFibRecursiveSync(num),
    minTimePromise,
  ]);
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

export  function getNthFibRecursiveMemo(num: number, memo: Cache = { 1: 0, 2: 1 }): Promise<number> {
  return Promise.resolve(getNthFibRecursiveMemoSync(num, memo));
}

function getNthFibRecursiveMemoSync(num: number, memo: Cache = { 1: 0, 2: 1 }): number {
  if (num in memo) {
    return memo[num];
  } else {
    memo[num] = getNthFibRecursiveMemoSync(num - 1, memo) + getNthFibRecursiveMemoSync(num - 2, memo);
    return memo[num];
  }
}

export function getNthFibLoop(num: number): Promise<number> {
  const previousTwoNum: [number, number] = [0, 1];
  let counter = 3;
  while (counter <= num) {
    const nextNum = previousTwoNum[0] + previousTwoNum[1];
    previousTwoNum[0] = previousTwoNum[1];
    previousTwoNum[1] = nextNum;
    counter++;
  }
  return Promise.resolve(num > 1 ? previousTwoNum[1] : previousTwoNum[0]);
}

export function getNthFibBinet(num: number): Promise<number> {
  return Promise.resolve(Math.round(
    (Math.pow((1 + Math.sqrt(5)) / 2, num - 1) - Math.pow((1 - Math.sqrt(5)) / 2, num - 1)) / Math.sqrt(5)
  ));
}
