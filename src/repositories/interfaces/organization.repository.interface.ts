import type { ClientSession } from 'mongoose';
import type { IBaseRepository } from './base.repository.interface.js';
import type { Organization } from '@/domain/entities/organization.entity.js';

export interface IOrganizationRepository extends IBaseRepository<Organization> {
  findBySlug(slug: string, session?: ClientSession): Promise<Organization | null>;
  findByName(name: string, session?: ClientSession): Promise<Organization | null>;
  findByIds(ids: string[], session?: ClientSession): Promise<Organization[]>;
}
