import type { OrgRole } from '@/domain/enums/org-role.enum.js';
import type { Organization } from '@/domain/entities/organization.entity.js';
import type { UserOrganization } from '@/domain/entities/user-organization.entity.js';
import type {
  CreateOrganizationInput,
  AddUserToOrganizationInput,
  UserOrganizationDetails,
  OrganizationWithMembersDetails,
} from '@/domain/types/organization.types.js';

export interface CreateOrganizationResult {
  organization: ReturnType<Organization['toPublicJson']>;
  role: OrgRole;
}

export interface IOrganizationService {
  createOrganization(userId: string, input: CreateOrganizationInput): Promise<CreateOrganizationResult>;
  getUserOrganizations(userId: string): Promise<UserOrganizationDetails[]>;
  getOrganizationById(organizationId: string): Promise<OrganizationWithMembersDetails | null>;
  addUserToOrganization(input: AddUserToOrganizationInput): Promise<UserOrganization>;
  getUserOrganizationRole(userId: string, organizationId: string): Promise<UserOrganization | null>;
}
