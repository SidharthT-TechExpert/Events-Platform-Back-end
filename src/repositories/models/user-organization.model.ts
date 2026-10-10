import { Schema, model, type Document, type Types } from 'mongoose';
import { OrgRole } from '@/domain/enums/org-role.enum.js';

export interface IUserOrganizationDocument extends Document {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  organization_id: Types.ObjectId;
  role: OrgRole;
  is_active: boolean;
  joined_at: Date;
  created_at: Date;
  updated_at: Date;
}

const userOrganizationSchema = new Schema<IUserOrganizationDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
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
      required: true,
    },
    joined_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
);

userOrganizationSchema.index({ user_id: 1, organization_id: 1 }, { unique: true });

export const UserOrganizationModel = model<IUserOrganizationDocument>(
  'UserOrganization',
  userOrganizationSchema,
);
