import { Organization } from '@/domain/entities/organization.entity.js';
import type { IOrganizationDocument } from '@/repositories/models/organization.model.js';
import type { IEntityMapper } from './entity.mapper.js';

export class OrganizationMapper implements IEntityMapper<Organization, IOrganizationDocument> {
  toDomain(document: IOrganizationDocument): Organization {
    return new Organization(
      document._id.toString(),
      document.name,
      document.slug,
      document.description,
      document.email,
      document.phone,
      document.website,
      document.logo_key,
      document.is_active,
      document.created_at,
      document.updated_at,
    );
  }

  toPersistence(entity: Organization): Record<string, unknown> {
    return {
      name: entity.name,
      slug: entity.slug,
      description: entity.description,
      email: entity.email,
      phone: entity.phone,
      website: entity.website,
      logo_key: entity.logo_key,
      is_active: entity.is_active,
    };
  }
}
