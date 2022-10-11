import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  private readonly FIB_SERVICE_USER = process.env.FIB_SERVICE_USER;
  private readonly FIB_SERVICE_PASS = process.env.FIB_SERVICE_PASS;

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.header('authorization');

    if (!this.FIB_SERVICE_USER || !this.FIB_SERVICE_PASS) {
      this.logger.debug("Basic auth hasn't been configured, skipping.");
      return true;
    }

    if (!authHeader) {
      // Throw 401 response code
      return false;
    }
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const [user, password] = auth;

    if (this.FIB_SERVICE_USER === user && this.FIB_SERVICE_PASS === password) {
      return true;
    }

    return false;
  }
}
