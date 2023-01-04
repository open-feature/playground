import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { FibonacciService } from './fibonacci/fibonacci.service';
import { HexColorService } from './hex-color/hex-color.service';
import { MessageService } from './message/message.service';

/**
 * Controller that delivers all the data to our FaaS landing page.
 */
@Controller()
export class FibonacciAsAServiceController {
  constructor(
    private readonly messageService: MessageService,
    private readonly fibonacciService: FibonacciService,
    private readonly hexColorService: HexColorService
  ) {}

  /**
   *
   * @returns welcome message
   */
  @Get('message')
  getGreeting() {
    return this.messageService.getMessage();
  }

  /**
   *
   * @returns hex color JSON for the UI.
   */
  @Get('hex-color')
  async getHexColor() {
    return {
      color: await this.hexColorService.getHexColor(),
    };
  }

  /**
   *
   * @returns hex color markup for standalone demo.
   */
  @Get('hex-color/markup')
  getHexColorMarkup() {
    return this.hexColorService.buildHexColorMarkup();
  }

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
