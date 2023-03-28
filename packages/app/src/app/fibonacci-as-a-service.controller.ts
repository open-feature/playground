import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { FibonacciService } from './fibonacci/fibonacci.service';

/**
 * Controller that delivers all the data to our FaaS landing page.
 */
@Controller()
export class FibonacciAsAServiceController {
  constructor(
    private readonly fibonacciService: FibonacciService,
  ) {}

  /**
   * Calculates fib(n)
   * @param num n value for fib(n)
   * @returns
   */
  @Get('calculate')
  async getFibonacci(@Query('num', new DefaultValuePipe(40), ParseIntPipe) num: number) {
    return this.fibonacciService.calculateFibonacci(num);
  }
}
