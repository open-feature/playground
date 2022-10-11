import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.header('authorization');

    if (!authHeader) {
      // Throw 401 response code
      return false;
    }
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const [user, password] = auth;

    if (process.env.FIB_SERVICE_USER === user && process.env.FIB_SERVICE_PASS === password) {
      return true;
    }

    return false;
  }
}
