import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { getNthFibBinet } from '@openfeature/fibonacci';
import { AuthGuard } from './auth.guard';

@Controller()
@UseGuards(new AuthGuard())
export class AppController {
  @Get('calculate')
  async getFibonacci(@Query('num', new DefaultValuePipe(50), ParseIntPipe) num: number) {
    return {
      result: getNthFibBinet(num),
    };
  }
}
