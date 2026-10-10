import { z } from 'zod';
import { OrgRole } from '@/domain/enums/org-role.enum.js';

const optionalRequestParts = {
  query: z.unknown().optional(),
  params: z.unknown().optional(),
};

export const createOrganizationBodySchema = z.object({
  name: z.string().trim().min(1, 'Organization name is required'),
  slug: z.string().trim().min(1).optional(),
  description: z.string().trim().nullable().optional(),
  email: z.string().trim().email().nullable().optional(),
  phone: z.string().trim().nullable().optional(),
  website: z.string().trim().url().nullable().optional(),
  logo_key: z.string().trim().nullable().optional(),
});

export const createOrganizationSchema = z.object({
  body: createOrganizationBodySchema,
  ...optionalRequestParts,
});

export const addUserToOrgBodySchema = z.object({
  userId: z.string().trim().min(1, 'User ID is required'),
  role: z.nativeEnum(OrgRole),
});

export const addUserToOrgSchema = z.object({
  body: addUserToOrgBodySchema,
  params: z.object({
    organizationId: z.string().trim().min(1, 'Organization ID is required'),
  }),
  query: z.unknown().optional(),
});

export type CreateOrganizationBody = z.infer<typeof createOrganizationBodySchema>;
export type AddUserToOrgBody = z.infer<typeof addUserToOrgBodySchema>;
