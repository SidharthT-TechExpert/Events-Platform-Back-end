import type { RequestHandler } from 'express';
import { UnauthorizedError } from '@/shared/errors/app-error.js';
import { RESPONSE_MESSAGE } from '@/shared/constants/response-message.enum.js';
import type {
  AuthenticatedUser,
  IAuthTokenService,
} from '@/services/interfaces/auth-token.service.interface.js';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthenticatedUser;
      user?: AuthenticatedUser & { id: string };
    }
  }
}

export function authenticate(tokenService: IAuthTokenService): RequestHandler {
  return (request, _response, next) => {
    let accessToken: string | undefined =
      typeof request.cookies?.accessToken === 'string' && request.cookies.accessToken.length > 0
        ? request.cookies.accessToken
        : undefined;

    if (!accessToken) {
      const authHeader = request.headers.authorization;
      if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7).trim();
        if (token.length > 0) {
          accessToken = token;
        }
      }
    }

    if (!accessToken) {
      next(new UnauthorizedError(RESPONSE_MESSAGE.UNAUTHORIZED));
      return;
    }

    try {
      const verified = tokenService.verifyAccessToken(accessToken);
      request.auth = verified;
      request.user = { id: verified.userId, ...verified };
      next();
    } catch (error) {
      next(error);
    }
  };
}
