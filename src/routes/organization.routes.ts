import { Router } from 'express';
import { container } from '@/di/container.js';
import { TYPES } from '@/di/types.js';
import { OrganizationController } from '@/controllers/organization.controller.js';
import type { IAuthTokenService } from '@/services/interfaces/auth-token.service.interface.js';
import { authenticate } from '@/middleware/authenticate.js';
import { validateRequest } from '@/middleware/validate-request.js';
import { createOrganizationSchema } from '@/schemas/organization.schema.js';
import { accessToOrgUser } from '@/middleware/access-to-org-user.js';
import { OrgRole } from '@/domain/enums/org-role.enum.js';

const router = Router();
const organizationController = container.get<OrganizationController>(
  TYPES.OrganizationController,
);
const authTokenService = container.get<IAuthTokenService>(TYPES.AuthTokenService);

// 1. Create Organization (creator becomes ADMIN in UserOrganization)
router.post(
  '/',
  authenticate(authTokenService),
  validateRequest(createOrganizationSchema),
  organizationController.createOrganization,
);
router.post(
  '/organizations',
  authenticate(authTokenService),
  validateRequest(createOrganizationSchema),
  organizationController.createOrganization,
);

// 2. Get User's Organizations (organizations the authenticated user is part of, with their role)
router.get(
  '/',
  authenticate(authTokenService),
  organizationController.getUserOrganizations,
);
router.get(
  '/organizations',
  authenticate(authTokenService),
  organizationController.getUserOrganizations,
);

// 3. Test access / check role with accessToOrgUser middleware
// Example: only ADMIN or EDITOR allowed
router.get(
  '/:organizationId/access-check',
  authenticate(authTokenService),
  accessToOrgUser([OrgRole.EDITOR, OrgRole.ADMIN]),
  organizationController.testAccess,
);

// 4. Get Organization by ID (only members of this organization can view it)
router.get(
  '/:organizationId',
  authenticate(authTokenService),
  accessToOrgUser([OrgRole.ADMIN, OrgRole.EDITOR, OrgRole.VIEWER]),
  organizationController.getOrganizationById,
);

export default router;
