import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

export class UserService {
  constructor(@Inject(REQUEST) private readonly req: Request) {}

  get user() {
    return this.req.user;
  }
}