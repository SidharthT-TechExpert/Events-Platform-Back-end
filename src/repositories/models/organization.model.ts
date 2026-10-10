import { Schema, model, type Document, type Types } from 'mongoose';
import { OrgRole } from '@/domain/enums/org-role.enum.js';

export interface IOrganizationMemberSubdocument {
  user_id: Types.ObjectId;
  role: OrgRole;
  is_active: boolean;
  joined_at: Date;
}

export interface IOrganizationDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  logo_key: string | null;
  is_active: boolean;
  members: IOrganizationMemberSubdocument[];
  created_at: Date;
  updated_at: Date;
}

const organizationMemberSchema = new Schema<IOrganizationMemberSubdocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(OrgRole),
      default: OrgRole.VIEWER,
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    joined_at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const organizationSchema = new Schema<IOrganizationDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    website: {
      type: String,
      default: null,
      trim: true,
    },
    logo_key: {
      type: String,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    members: {
      type: [organizationMemberSchema],
      default: [],
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
);

export const OrganizationModel = model<IOrganizationDocument>('Organization', organizationSchema);
