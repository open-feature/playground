import { Controller, Get, Query } from '@nestjs/common';
import { fibonacci } from '@openfeature/fibonacci';
import { HexColorService } from './hex-color/hex-color.service';
import { InstallService } from './install/install.service';
import { MessageService } from './message/message.service';

/**
 * Controller that delivers all the data to our FaaS landing page.
 */
@Controller()
export class FibonacciAsAServiceController {
  constructor(
    private readonly messageService: MessageService,
    private readonly installService: InstallService,
    private helloService: HexColorService
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
   * @returns hex color for the UI.
   */
  @Get('hex-color')
  async getHexColor() {
    return {
      color: await this.helloService.getHexColor(),
    };
  }

  /**
   * Calculates fib(n)
   * @param num n value for fib(n)
   * @returns
   */
  @Get('calculate')
  async getFibonacci(@Query('num') num: string) {
    return {
      result: await fibonacci(Number.parseInt(num)),
    };
  }
}
