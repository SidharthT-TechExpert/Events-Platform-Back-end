import type { OrgRole } from '@/domain/enums/org-role.enum.js';
import type { Organization } from '@/domain/entities/organization.entity.js';
import type { UserOrganization } from '@/domain/entities/user-organization.entity.js';

export interface CreateOrganizationInput {
  name: string;
  slug?: string | undefined;
  description?: string | null | undefined;
  email?: string | null | undefined;
  phone?: string | null | undefined;
  website?: string | null | undefined;
  logo_key?: string | null | undefined;
}

export interface AddUserToOrganizationInput {
  userId: string;
  organizationId: string;
  role: OrgRole;
}

export interface UserOrganizationDetails {
  id: string;
  organization_id: string;
  role: OrgRole;
  is_active: boolean;
  name: string;
  slug: string;
  description: string | null;
  logo_key: string | null;
}

export interface OrganizationMemberDetail {
  id: string;
  fullname: string;
  role: OrgRole;
  is_active: boolean;
}

export interface OrganizationWithMembersDetails {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  logo_key: string | null;
  is_active: boolean;
  members: OrganizationMemberDetail[];
  created_at: Date;
  updated_at: Date;
}
