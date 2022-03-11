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
    it(`Fibonacci Loop: ${testDescription}`, () => {
      expect(getNthFibLoop(input)).toEqual(output);
    });

    it(`Fibonacci recursive: ${testDescription}`, () => {
      expect(getNthFibRecursive(input)).toEqual(output);
    });

    it(`Fibonacci memo: ${testDescription}`, () => {
      expect(getNthFibRecursiveMemo(input)).toEqual(output);
    });

    it(`Fibonacci binet: ${testDescription}`, () => {
      expect(getNthFibBinet(input)).toEqual(output);
    });
  }
});
