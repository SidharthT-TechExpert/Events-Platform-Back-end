import { UserOrganization } from '@/domain/entities/user-organization.entity.js';
import type { IUserOrganizationDocument } from '@/repositories/models/user-organization.model.js';
import type { IEntityMapper } from './entity.mapper.js';
import { Types } from 'mongoose';

export class UserOrganizationMapper
  implements IEntityMapper<UserOrganization, IUserOrganizationDocument>
{
  toDomain(document: IUserOrganizationDocument): UserOrganization {
    return new UserOrganization(
      document._id.toString(),
      document.user_id.toString(),
      document.organization_id.toString(),
      document.role,
      document.is_active,
      document.joined_at,
      document.created_at,
      document.updated_at,
    );
  }

  toPersistence(entity: UserOrganization): Record<string, unknown> {
    return {
      user_id: new Types.ObjectId(entity.user_id),
      organization_id: new Types.ObjectId(entity.organization_id),
      role: entity.role,
      is_active: entity.is_active,
      joined_at: entity.joined_at,
    };
  }
}
