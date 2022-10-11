import { getNthFibRecursive, getNthFibRecursiveMemo, getNthFibLoop, getNthFibBinet } from './fibonacci';

describe('nth fibonacci', () => {

  const tests: Array<[number, number]> = [
    [1, 0],
    [2, 1],
    [3, 1],
    [4, 2],
    [5, 3],
    [6, 5],
    [7, 8],
    [8, 13],
    [9, 21],
    [10, 34],
    [11, 55],
    [12, 89],
    [13, 144],
    [14, 233],
    [15, 377],
    [16, 610],
  ];

  for (const test of tests) {
    const [input, output] = test
    const testDescription = `${input} should be ${output}`
    it(`Fibonacci Loop: ${testDescription}`, async () => {
      expect(await getNthFibLoop(input)).toEqual(output);
    });

    it(`Fibonacci recursive: ${testDescription}`, async () => {
      expect(await getNthFibRecursive(input)).toEqual(output);
    });

    it(`Fibonacci memo: ${testDescription}`, async () => {
      expect(await getNthFibRecursiveMemo(input)).toEqual(output);
    });

    it(`Fibonacci binet: ${testDescription}`, async () => {
      expect(await getNthFibBinet(input)).toEqual(output);
    });
  }
});
