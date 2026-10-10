import { injectable } from 'inversify';
import { Types, type ClientSession } from 'mongoose';
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
    const userQuery = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;
    const orgQuery = Types.ObjectId.isValid(organizationId)
      ? new Types.ObjectId(organizationId)
      : organizationId;
    return this.findOne({ user_id: userQuery, organization_id: orgQuery }, session);
  }

  async findByUserId(userId: string, session?: ClientSession): Promise<UserOrganization[]> {
    const userQuery = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;
    return this.find({ user_id: userQuery }, session);
  }

  async findByOrganizationId(
    organizationId: string,
    session?: ClientSession,
  ): Promise<UserOrganization[]> {
    const orgQuery = Types.ObjectId.isValid(organizationId)
      ? new Types.ObjectId(organizationId)
      : organizationId;
    return this.find({ organization_id: orgQuery }, session);
  }
}
