import type { RequestHandler } from 'express';
import { container } from '@/di/container.js';
import { TYPES } from '@/di/types.js';
import type { IUserOrganizationRepository } from '@/repositories/interfaces/user-organization.repository.interface.js';
import type { UserOrganization } from '@/domain/entities/user-organization.entity.js';
import { ForbiddenError, UnauthorizedError } from '@/shared/errors/app-error.js';
import { RESPONSE_MESSAGE } from '@/shared/constants/response-message.enum.js';
import type { OrgRole } from '@/domain/enums/org-role.enum.js';

declare global {
  namespace Express {
    interface Request {
      orgUser?: UserOrganization;
      userOrganization?: UserOrganization;
    }
  }
}

export function accessToOrgUser(
  allowedRoles: (OrgRole | string)[],
  customUserOrgRepo?: IUserOrganizationRepository,
): RequestHandler {
  const normalizedAllowedRoles = allowedRoles.map((role) => role.toUpperCase());

  return async (request, _response, next) => {
    try {
      const userId = request.user?.id ?? request.user?.userId ?? request.auth?.userId;
      if (!userId) {
        next(new UnauthorizedError(RESPONSE_MESSAGE.UNAUTHORIZED));
        return;
      }

      const organizationId =
        request.params['organizationId'] ??
        request.params['id'] ??
        (request.body as Record<string, unknown> | undefined)?.['organizationId'];

      if (!organizationId || typeof organizationId !== 'string') {
        next(new ForbiddenError(RESPONSE_MESSAGE.FORBIDDEN));
        return;
      }

      const repo =
        customUserOrgRepo ??
        container.get<IUserOrganizationRepository>(TYPES.UserOrganizationRepository);

      const userOrg = await repo.findByUserAndOrganization(userId, organizationId);
      if (!userOrg) {
        next(new ForbiddenError(RESPONSE_MESSAGE.FORBIDDEN));
        return;
      }

      if (!userOrg.is_active) {
        next(new ForbiddenError(RESPONSE_MESSAGE.FORBIDDEN));
        return;
      }

      if (!normalizedAllowedRoles.includes(userOrg.role.toUpperCase())) {
        next(new ForbiddenError(RESPONSE_MESSAGE.FORBIDDEN));
        return;
      }

      request.orgUser = userOrg;
      request.userOrganization = userOrg;
      next();
    } catch (error) {
      next(error);
    }
  };
}
