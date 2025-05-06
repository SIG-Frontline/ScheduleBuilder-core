import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JWTAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class ApiTokenGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const authHeader: string = (req.headers['authorization'] || '') as string;

    const token =
      authHeader.startsWith('Bearer ') || authHeader.startsWith('bearer ')
        ? authHeader.slice(7).trim()
        : authHeader.trim();

    const envToken = process.env.ADMIN_SECRET;

    if (!envToken) {
      throw new UnauthorizedException('Missing Admin Secret');
    }
    if (!envToken || token !== envToken) {
      throw new UnauthorizedException('Invalid API token');
    }

    return true;
  }
}
