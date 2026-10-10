import { injectable } from 'inversify';
import type { ClientSession } from 'mongoose';
import { BaseRepository } from './base.repository.js';
import type { IOrganizationRepository } from '../interfaces/organization.repository.interface.js';
import { OrganizationMapper } from '../mappers/organization.mapper.js';
import type { Organization } from '@/domain/entities/organization.entity.js';
import {
  OrganizationModel,
  type IOrganizationDocument,
} from '../models/organization.model.js';

@injectable()
export class OrganizationRepository
  extends BaseRepository<Organization, IOrganizationDocument>
  implements IOrganizationRepository
{
  constructor() {
    super(OrganizationModel, new OrganizationMapper());
  }

  async findBySlug(slug: string, session?: ClientSession): Promise<Organization | null> {
    return this.findOne({ slug: slug.toLowerCase().trim() }, session);
  }

  async findByName(name: string, session?: ClientSession): Promise<Organization | null> {
    return this.findOne({ name: name.trim() }, session);
  }

  async findByIds(ids: string[], session?: ClientSession): Promise<Organization[]> {
    if (ids.length === 0) return [];
    return this.find({ _id: { $in: ids } }, session);
  }
}
