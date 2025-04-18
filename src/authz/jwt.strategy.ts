/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { Logger } from '@nestjs/common';
import * as jwksRsa from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    Logger.debug(process.env.AUTH0_DOMAIN);
    Logger.debug(process.env.AUTH0_AUDIENCE);
    super({
      // Dynamically provide signing keys based on the kid in the header and
      // the JWKS endpoint from your Auth0 tenant
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
      }),

      // where to find the JWT on incoming requests
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // validate these claims
      audience: process.env.AUTH0_AUDIENCE, // your API identifier
      issuer: `${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256'],
    } as StrategyOptions);
  }

  // `validate()` is called once the token is verified;
  // its return value is injected as `req.user`
  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(payload: any) {
    // you can add more checks here (e.g. user exists in your DB)
    Logger.debug(payload);
    return { sub: payload.sub, scope: payload.scope, ...payload };
  }
}
