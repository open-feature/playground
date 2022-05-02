import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { BasicStrategy as Strategy } from 'passport-http';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      passReqToCallback: true,
    });
  }

  public validate = async (
    _: Request,
    username: string,
    password: string
  ): Promise<any> => {
    if (
      process.env.BASIC_AUTH_USER === username &&
      process.env.BASIC_AUTH_PASSWORD === password
    ) {
      return {
        username,
      };
    }
    throw new UnauthorizedException();
  };
}
