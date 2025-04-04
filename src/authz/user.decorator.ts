/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export interface Auth0User {
  sub: string;
  name: string;
  email?: string;
  // add other Auth0 fields as needed
}

export const User = createParamDecorator(
  (data: keyof Auth0User, ctx: ExecutionContext): Auth0User | string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as Auth0User;
    return data ? user[data]! : user;
  },
);
