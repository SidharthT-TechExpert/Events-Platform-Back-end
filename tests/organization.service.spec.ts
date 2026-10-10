import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrganizationService } from '../src/services/organization/organization.service.js';
import { Organization } from '../src/domain/entities/organization.entity.js';
import { UserOrganization } from '../src/domain/entities/user-organization.entity.js';
import { User } from '../src/domain/entities/user.entity.js';
import { OrgRole } from '../src/domain/enums/org-role.enum.js';
import { UserRole } from '../src/domain/enums/user-role.enum.js';
import type { IOrganizationRepository } from '../src/repositories/interfaces/organization.repository.interface.js';
import type { IUserOrganizationRepository } from '../src/repositories/interfaces/user-organization.repository.interface.js';
import type { IUserRepository } from '../src/repositories/interfaces/user.repository.interface.js';
import type { IUnitOfWork } from '../src/infrastructure/unit-of-work/unit-of-work.interface.js';

describe('OrganizationService', () => {
  let orgRepo: Partial<IOrganizationRepository>;
  let userOrgRepo: Partial<IUserOrganizationRepository>;
  let userRepo: Partial<IUserRepository>;
  let uow: IUnitOfWork;
  let service: OrganizationService;

  const mockUser = new User(
    'user-1',
    'Sidharth T',
    '8848096746',
    'hashedpass',
    'sidhartht900@gmail.com',
    null,
    null,
    true,
    false,
    UserRole.USER,
  );

  beforeEach(() => {
    orgRepo = {
      create: vi.fn().mockImplementation((org: Organization) =>
        Promise.resolve(
          new Organization(
            'org-1',
            org.name,
            org.slug,
            org.description,
            org.email,
            org.phone,
            org.website,
            org.logo_key,
            org.is_active,
            org.created_at,
            org.updated_at,
          ),
        ),
      ),
      findBySlug: vi.fn().mockResolvedValue(null),
      findById: vi.fn(),
      findByIds: vi.fn(),
    };

    userOrgRepo = {
      create: vi.fn().mockImplementation((uo: UserOrganization) =>
        Promise.resolve(
          new UserOrganization(
            'uo-1',
            uo.user_id,
            uo.organization_id,
            uo.role,
            uo.is_active,
            uo.joined_at,
            uo.created_at,
            uo.updated_at,
          ),
        ),
      ),
      findByUserId: vi.fn(),
      findByUserAndOrganization: vi.fn(),
    };

    userRepo = {
      findById: vi.fn().mockResolvedValue(mockUser),
    };

    uow = {
      execute: vi.fn().mockImplementation((op) => op({} as any)),
    };

    service = new OrganizationService(
      orgRepo as IOrganizationRepository,
      userOrgRepo as IUserOrganizationRepository,
      userRepo as IUserRepository,
      uow,
    );
  });

  it('creates an organization and assigns creator as ADMIN in UserOrganization', async () => {
    const result = await service.createOrganization('user-1', {
      name: 'Future Club',
      description: 'Official Club',
    });

    expect(result.organization.name).toBe('Future Club');
    expect(result.organization.slug).toBe('future-club');
    expect(result.role).toBe(OrgRole.ADMIN);
    expect(userOrgRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        role: OrgRole.ADMIN,
      }),
      expect.anything(),
    );
  });

  it('returns all organizations that user belongs to with distinct roles (ADMIN, EDITOR, VIEWER)', async () => {
    const userOrgs = [
      new UserOrganization('uo-1', 'user-1', 'org-1', OrgRole.ADMIN, true),
      new UserOrganization('uo-2', 'user-1', 'org-2', OrgRole.EDITOR, true),
      new UserOrganization('uo-3', 'user-1', 'org-3', OrgRole.VIEWER, true),
    ];
    (userOrgRepo.findByUserId as any).mockResolvedValue(userOrgs);

    const org1 = new Organization('org-1', 'Future Club', 'future-club');
    const org2 = new Organization('org-2', 'Where Is My Event', 'where-is-my-event');
    const org3 = new Organization('org-3', 'Kerala Tech Community', 'kerala-tech-community');
    (orgRepo.findByIds as any).mockResolvedValue([org1, org2, org3]);

    const result = await service.getUserOrganizations('user-1');

    expect(result).toHaveLength(3);

    // Organization 1: ADMIN
    expect(result[0]!.organization.name).toBe('Future Club');
    expect(result[0]!.name).toBe('Future Club');
    expect(result[0]!.slug).toBe('future-club');
    expect(result[0]!.user_id).toBe('user-1');
    expect(result[0]!.organization_id).toBe('org-1');
    expect(result[0]!.role).toBe(OrgRole.ADMIN);

    // Organization 2: EDITOR
    expect(result[1]!.organization.name).toBe('Where Is My Event');
    expect(result[1]!.name).toBe('Where Is My Event');
    expect(result[1]!.slug).toBe('where-is-my-event');
    expect(result[1]!.user_id).toBe('user-1');
    expect(result[1]!.organization_id).toBe('org-2');
    expect(result[1]!.role).toBe(OrgRole.EDITOR);

    // Organization 3: VIEWER
    expect(result[2]!.organization.name).toBe('Kerala Tech Community');
    expect(result[2]!.name).toBe('Kerala Tech Community');
    expect(result[2]!.slug).toBe('kerala-tech-community');
    expect(result[2]!.user_id).toBe('user-1');
    expect(result[2]!.organization_id).toBe('org-3');
    expect(result[2]!.role).toBe(OrgRole.VIEWER);
  });

  it('strictly isolates organizations by user_id so user-2 never sees user-1 organizations', async () => {
    (userOrgRepo.findByUserId as any).mockImplementation((uid: string) => {
      if (uid === 'user-1') {
        return Promise.resolve([
          new UserOrganization('uo-1', 'user-1', 'org-1', OrgRole.ADMIN, true),
        ]);
      }
      return Promise.resolve([]);
    });

    const org1 = new Organization('org-1', 'Private Corp', 'private-corp');
    (orgRepo.findByIds as any).mockResolvedValue([org1]);

    const user1Result = await service.getUserOrganizations('user-1');
    expect(user1Result).toHaveLength(1);
    expect(user1Result[0]!.name).toBe('Private Corp');

    const user2Result = await service.getUserOrganizations('user-2');
    expect(user2Result).toHaveLength(0);
    expect(userOrgRepo.findByUserId).toHaveBeenCalledWith('user-2');
  });
});
