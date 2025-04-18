import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from '@nestjs/common';
export interface Auth0User {
  sub: string;
  name: string;
}

interface UserParam extends Request {
  user: Auth0User;
}

export const User = createParamDecorator(
  (data: keyof Auth0User, ctx: ExecutionContext): Auth0User | string => {
    const request: UserParam = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user[data] : user;
  },
);
