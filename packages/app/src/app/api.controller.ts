import { Controller, Get, Query } from '@nestjs/common';
import { FibonacciService } from './fibonacci.service';
import { MessageService } from './message.service';
import { UserService } from './user.service';
import { fibonacci } from '@openfeature/fibonacci';

@Controller()
export class AppController {
  constructor(
    private readonly messageService: MessageService,
    private readonly fibonacciService: FibonacciService,
    private userService: UserService
  ) {}

  @Get()
  getGreeting() {
    return this.messageService.getMessage();
  }

  @Get('fibonacci')
  getFibonacci(@Query('num') num: string) {
    // TODO: validation
    return fibonacci(Number.parseInt(num));
  }
}
