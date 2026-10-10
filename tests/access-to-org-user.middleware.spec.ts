import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { accessToOrgUser } from '../src/middleware/access-to-org-user.js';
import { OrgRole } from '../src/domain/enums/org-role.enum.js';
import { UserOrganization } from '../src/domain/entities/user-organization.entity.js';
import type { IUserOrganizationRepository } from '../src/repositories/interfaces/user-organization.repository.interface.js';
import { ForbiddenError, UnauthorizedError } from '../src/shared/errors/app-error.js';

describe('accessToOrgUser middleware', () => {
  const mockRepo = (userOrg: UserOrganization | null): IUserOrganizationRepository => ({
    create: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
    updateById: vi.fn(),
    deleteById: vi.fn(),
    findByUserAndOrganization: vi.fn().mockResolvedValue(userOrg),
    findByUserId: vi.fn(),
    findByOrganizationId: vi.fn(),
  });

  it('calls next() when user has allowed role (ADMIN)', async () => {
    const userOrg = new UserOrganization(
      'uo-1',
      'user-1',
      'org-1',
      OrgRole.ADMIN,
      true,
    );
    const repo = mockRepo(userOrg);
    const middleware = accessToOrgUser([OrgRole.ADMIN, OrgRole.EDITOR], repo);

    const req = {
      user: { id: 'user-1' },
      params: { organizationId: 'org-1' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.userOrganization).toBe(userOrg);
  });

  it('calls next() when allowed roles are case-insensitive ("admin", "EDITOR")', async () => {
    const userOrg = new UserOrganization(
      'uo-1',
      'user-1',
      'org-1',
      OrgRole.ADMIN,
      true,
    );
    const repo = mockRepo(userOrg);
    const middleware = accessToOrgUser(['EDITOR', 'admin'], repo);

    const req = {
      user: { id: 'user-1' },
      params: { organizationId: 'org-1' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.userOrganization).toBe(userOrg);
  });

  it('calls next with 403 ForbiddenError when role is not allowed (VIEWER when EDITOR is required)', async () => {
    const userOrg = new UserOrganization(
      'uo-1',
      'user-1',
      'org-1',
      OrgRole.VIEWER,
      true,
    );
    const repo = mockRepo(userOrg);
    const middleware = accessToOrgUser(['EDITOR'], repo);

    const req = {
      user: { id: 'user-1' },
      params: { organizationId: 'org-1' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    const error = next.mock.calls[0]![0] as ForbiddenError;
    expect(error.statusCode).toBe(403);
  });

  it('calls next with 403 ForbiddenError when user organization is inactive', async () => {
    const userOrg = new UserOrganization(
      'uo-1',
      'user-1',
      'org-1',
      OrgRole.ADMIN,
      false, // inactive!
    );
    const repo = mockRepo(userOrg);
    const middleware = accessToOrgUser([OrgRole.ADMIN], repo);

    const req = {
      user: { id: 'user-1' },
      params: { organizationId: 'org-1' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    const error = next.mock.calls[0]![0] as ForbiddenError;
    expect(error.statusCode).toBe(403);
  });

  it('calls next with 403 ForbiddenError when user is not member of organization', async () => {
    const repo = mockRepo(null);
    const middleware = accessToOrgUser([OrgRole.ADMIN], repo);

    const req = {
      user: { id: 'user-1' },
      params: { organizationId: 'org-1' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    const error = next.mock.calls[0]![0] as ForbiddenError;
    expect(error.statusCode).toBe(403);
  });

  it('calls next with 401 UnauthorizedError when req.user is missing', async () => {
    const repo = mockRepo(null);
    const middleware = accessToOrgUser([OrgRole.ADMIN], repo);

    const req = {
      params: { organizationId: 'org-1' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});
