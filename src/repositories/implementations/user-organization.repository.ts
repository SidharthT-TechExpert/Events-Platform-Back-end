import { injectable } from 'inversify';
import type { ClientSession } from 'mongoose';
import { BaseRepository } from './base.repository.js';
import type { IUserOrganizationRepository } from '../interfaces/user-organization.repository.interface.js';
import { UserOrganizationMapper } from '../mappers/user-organization.mapper.js';
import type { UserOrganization } from '@/domain/entities/user-organization.entity.js';
import {
  UserOrganizationModel,
  type IUserOrganizationDocument,
} from '../models/user-organization.model.js';

@injectable()
export class UserOrganizationRepository
  extends BaseRepository<UserOrganization, IUserOrganizationDocument>
  implements IUserOrganizationRepository
{
  constructor() {
    super(UserOrganizationModel, new UserOrganizationMapper());
  }

  async findByUserAndOrganization(
    userId: string,
    organizationId: string,
    session?: ClientSession,
  ): Promise<UserOrganization | null> {
    return this.findOne({ user_id: userId, organization_id: organizationId }, session);
  }

  async findByUserId(userId: string, session?: ClientSession): Promise<UserOrganization[]> {
    return this.find({ user_id: userId }, session);
  }

  async findByOrganizationId(
    organizationId: string,
    session?: ClientSession,
  ): Promise<UserOrganization[]> {
    return this.find({ organization_id: organizationId }, session);
  }
}
