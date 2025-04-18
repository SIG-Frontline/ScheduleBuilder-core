import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
  SecretOrKeyProvider,
  StrategyOptionsWithoutRequest,
} from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';

interface UserPayload {
  iss: string;
  sub: string;
  aud: string[];
  iat: number;
  exp: number;
  scope: string;
  azp: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
      }) as SecretOrKeyProvider,

      // obtain JWT as bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // validate these claims
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256'],
      passReqToCallback: false,
    } as StrategyOptionsWithoutRequest);
  }

  // `validate()` is called once the token is verified;
  validate(payload: UserPayload) {
    // Any other items needed per validation can be added here
    return { sub: payload.sub, scope: payload.scope };
  }
}
