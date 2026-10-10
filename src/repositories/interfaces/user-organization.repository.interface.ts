import type { ClientSession } from 'mongoose';
import type { IBaseRepository } from './base.repository.interface.js';
import type { UserOrganization } from '@/domain/entities/user-organization.entity.js';

export interface IUserOrganizationRepository extends IBaseRepository<UserOrganization> {
  findByUserAndOrganization(
    userId: string,
    organizationId: string,
    session?: ClientSession,
  ): Promise<UserOrganization | null>;
  findByUserId(userId: string, session?: ClientSession): Promise<UserOrganization[]>;
  findByOrganizationId(organizationId: string, session?: ClientSession): Promise<UserOrganization[]>;
}
