import { inject, injectable } from 'inversify';
import { TYPES } from '@/di/types.js';
import { Organization } from '@/domain/entities/organization.entity.js';
import { UserOrganization } from '@/domain/entities/user-organization.entity.js';
import { OrgRole } from '@/domain/enums/org-role.enum.js';
import type { IOrganizationRepository } from '@/repositories/interfaces/organization.repository.interface.js';
import type { IUserOrganizationRepository } from '@/repositories/interfaces/user-organization.repository.interface.js';
import type { IUserRepository } from '@/repositories/interfaces/user.repository.interface.js';
import type { IUnitOfWork } from '@/infrastructure/unit-of-work/unit-of-work.interface.js';
import type {
  IOrganizationService,
  CreateOrganizationResult,
} from '../interfaces/organization.service.interface.js';
import type {
  CreateOrganizationInput,
  AddUserToOrganizationInput,
  UserOrganizationDetails,
  OrganizationWithMembersDetails,
  OrganizationMemberDetail,
} from '@/domain/types/organization.types.js';
import { BadRequestError, ConflictError, NotFoundError } from '@/shared/errors/app-error.js';
import { RESPONSE_MESSAGE } from '@/shared/constants/response-message.enum.js';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

@injectable()
export class OrganizationService implements IOrganizationService {
  constructor(
    @inject(TYPES.OrganizationRepository)
    private readonly organizationRepository: IOrganizationRepository,
    @inject(TYPES.UserOrganizationRepository)
    private readonly userOrganizationRepository: IUserOrganizationRepository,
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository,
    @inject(TYPES.UnitOfWork)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async createOrganization(
    userId: string,
    input: CreateOrganizationInput,
  ): Promise<CreateOrganizationResult> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(RESPONSE_MESSAGE.USER_NOT_FOUND);
    }

    const baseSlug = slugify(input.slug && input.slug.length > 0 ? input.slug : input.name);
    if (!baseSlug) {
      throw new BadRequestError(RESPONSE_MESSAGE.VALIDATION_FAILED, {
        message: 'Invalid organization name or slug',
      });
    }

    let finalSlug = baseSlug;
    let counter = 1;
    while (await this.organizationRepository.findBySlug(finalSlug)) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    const result = await this.unitOfWork.execute(async (session) => {
      const organization = await this.organizationRepository.create(
        new Organization(
          undefined,
          input.name.trim(),
          finalSlug,
          input.description?.trim() ?? null,
          input.email?.toLowerCase().trim() ?? null,
          input.phone?.trim() ?? null,
          input.website?.trim() ?? null,
          input.logo_key ?? null,
          true,
        ),
        session,
      );

      await this.userOrganizationRepository.create(
        new UserOrganization(
          undefined,
          user.id,
          organization.id,
          OrgRole.ADMIN,
          true,
          new Date(),
        ),
        session,
      );

      return organization;
    });

    return {
      organization: result.toPublicJson(),
      role: OrgRole.ADMIN,
    };
  }

  async getUserOrganizations(userId: string): Promise<UserOrganizationDetails[]> {
    const userOrgs = await this.userOrganizationRepository.findByUserId(userId);
    if (userOrgs.length === 0) {
      return [];
    }

    const orgIds = userOrgs.map((uo) => uo.organization_id);
    const organizations = await this.organizationRepository.findByIds(orgIds);
    const orgMap = new Map<string, Organization>();
    for (const org of organizations) {
      orgMap.set(org.id, org);
    }

    const result: UserOrganizationDetails[] = [];
    for (const uo of userOrgs) {
      const org = orgMap.get(uo.organization_id);
      if (org) {
        result.push({
          id: uo.id,
          organization_id: uo.organization_id,
          role: uo.role,
          is_active: uo.is_active,
          name: org.name,
          slug: org.slug,
          description: org.description,
          logo_key: org.logo_key,
        });
      }
    }

    return result;
  }

  async getOrganizationById(
    organizationId: string,
  ): Promise<OrganizationWithMembersDetails | null> {
    const org = await this.organizationRepository.findById(organizationId);
    if (!org) {
      return null;
    }

    const userOrgs = await this.userOrganizationRepository.findByOrganizationId(organizationId);
    const userIds = userOrgs.map((uo) => uo.user_id);
    const users =
      userIds.length > 0 ? await this.userRepository.find({ _id: { $in: userIds } }) : [];
    const userMap = new Map();
    for (const u of users) {
      userMap.set(u.id, u);
    }

    const members: OrganizationMemberDetail[] = userOrgs.map((uo) => {
      const u = userMap.get(uo.user_id);
      return {
        id: uo.id,
        fullname: u ? u.fullname : 'Unknown',
        role: uo.role,
        is_active: uo.is_active,
      };
    });

    return {
      ...org.toPublicJson(),
      members,
    };
  }

  async addUserToOrganization(input: AddUserToOrganizationInput): Promise<UserOrganization> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError(RESPONSE_MESSAGE.USER_NOT_FOUND);
    }

    const org = await this.organizationRepository.findById(input.organizationId);
    if (!org) {
      throw new NotFoundError(RESPONSE_MESSAGE.ORGANIZATION_NOT_FOUND);
    }

    const existing = await this.userOrganizationRepository.findByUserAndOrganization(
      input.userId,
      input.organizationId,
    );
    if (existing) {
      throw new ConflictError(RESPONSE_MESSAGE.VALIDATION_FAILED, {
        message: 'User is already a member of this organization',
      });
    }

    return this.userOrganizationRepository.create(
      new UserOrganization(
        undefined,
        input.userId,
        input.organizationId,
        input.role,
        true,
        new Date(),
      ),
    );
  }

  async getUserOrganizationRole(
    userId: string,
    organizationId: string,
  ): Promise<UserOrganization | null> {
    return this.userOrganizationRepository.findByUserAndOrganization(userId, organizationId);
  }
}
