import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { fibonacci } from '@openfeature/fibonacci';
import { AuthGuard } from './auth.guard';

@Controller()
@UseGuards(new AuthGuard())
export class AppController {
  @Get('calculate')
  async getFibonacci(@Query('num', new DefaultValuePipe(40), ParseIntPipe) num: number) {
    return {
      result: await fibonacci(num),
    };
  }
}
