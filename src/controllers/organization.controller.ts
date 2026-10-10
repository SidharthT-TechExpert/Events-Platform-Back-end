import { inject, injectable } from 'inversify';
import type { NextFunction, Request, Response } from 'express';
import { TYPES } from '@/di/types.js';
import type { IOrganizationService } from '@/services/interfaces/organization.service.interface.js';
import { RESPONSE_MESSAGE } from '@/shared/constants/response-message.enum.js';
import { successResponse } from '@/shared/types/api-response.js';
import { NotFoundError, UnauthorizedError } from '@/shared/errors/app-error.js';
import type { CreateOrganizationBody } from '@/schemas/organization.schema.js';

@injectable()
export class OrganizationController {
  constructor(
    @inject(TYPES.OrganizationService)
    private readonly organizationService: IOrganizationService,
  ) {}

  createOrganization = async (
    request: Request<Record<string, string>, unknown, CreateOrganizationBody>,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = request.user?.id ?? request.auth?.userId;
      if (!userId) {
        throw new UnauthorizedError(RESPONSE_MESSAGE.UNAUTHORIZED);
      }

      const result = await this.organizationService.createOrganization(userId, request.body);
      response
        .status(201)
        .json(successResponse(RESPONSE_MESSAGE.ORGANIZATION_CREATED, result));
    } catch (error) {
      next(error);
    }
  };

  getUserOrganizations = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = request.user?.id ?? request.auth?.userId;
      if (!userId) {
        throw new UnauthorizedError(RESPONSE_MESSAGE.UNAUTHORIZED);
      }

      const result = await this.organizationService.getUserOrganizations(userId);
      response.json(successResponse(RESPONSE_MESSAGE.ORGANIZATIONS_FETCHED, result));
    } catch (error) {
      next(error);
    }
  };

  getOrganizationById = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const rawOrgId = request.params['organizationId'] ?? request.params['id'];
      const orgId = Array.isArray(rawOrgId) ? rawOrgId[0] : rawOrgId;
      if (!orgId || typeof orgId !== 'string') {
        throw new NotFoundError(RESPONSE_MESSAGE.ORGANIZATION_NOT_FOUND);
      }

      const org = await this.organizationService.getOrganizationById(orgId);
      if (!org) {
        throw new NotFoundError(RESPONSE_MESSAGE.ORGANIZATION_NOT_FOUND);
      }

      response.json(successResponse(RESPONSE_MESSAGE.ORGANIZATION_FETCHED, org));
    } catch (error) {
      next(error);
    }
  };

  testAccess = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      response.json(
        successResponse(RESPONSE_MESSAGE.ORGANIZATION_FETCHED, {
          accessGranted: true,
          userOrganization: request.userOrganization?.toJSON(),
        }),
      );
    } catch (error) {
      next(error);
    }
  };
}
