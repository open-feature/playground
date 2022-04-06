import { Controller, Get, Query } from '@nestjs/common';
import { fibonacci } from '@openfeature/fibonacci';
import { HelloService } from './hello/hello.service';
import { InstallService } from './install/install.service';
import { MessageService } from './message/message.service';

@Controller()
export class AppController {
  constructor(
    private readonly messageService: MessageService,
    private readonly installService: InstallService,
    private helloService: HelloService
  ) {}

  @Get()
  getGreeting() {
    return this.messageService.getMessage();
  }

  @Get('hello')
  getHelloMarkup() {
    return this.helloService.buildHelloMarkup();
  }

  @Get('install')
  getInstallMarkup() {
    return this.installService.buildInstallMarkup();
  }

  @Get('fibonacci')
  getFibonacci(@Query('num') num: string) {
    // TODO: validation
    return fibonacci(Number.parseInt(num));
  }
}
