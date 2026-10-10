import { Schema, model, type Document, type Types } from 'mongoose';

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
  created_at: Date;
  updated_at: Date;
}

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
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
);

export const OrganizationModel = model<IOrganizationDocument>('Organization', organizationSchema);
