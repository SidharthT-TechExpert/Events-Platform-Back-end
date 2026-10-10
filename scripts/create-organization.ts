import mongoose from 'mongoose';
import { UserModel } from '../src/repositories/models/user.model.js';
import { OrganizationModel } from '../src/repositories/models/organization.model.js';
import { UserOrganizationModel } from '../src/repositories/models/user-organization.model.js';
import { UserRole } from '../src/domain/enums/user-role.enum.js';
import { OrgRole } from '../src/domain/enums/org-role.enum.js';
import { hashPassword } from '../src/shared/utils/password.util.js';
import { AuthTokenService } from '../src/services/auth/auth-token.service.js';

const MONGODB_URI = process.env['MONGODB_URI'];
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable must be configured in .env');
}

const USER_EMAIL = 'sidhartht900@gmail.com';
const USER_PHONE = '8848096746';
const USER_RAW_PASS = 'Sidhu@123';
const USER_FULLNAME = 'Sidharth T';

const ORG_NAME = process.argv[2] ?? 'Future Club';
const ORG_SLUG =
  process.argv[3] ??
  ORG_NAME.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

async function run(): Promise<void> {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB successfully.\n');

  try {
    // 1. Create or update user
    console.log(`Checking user: email=${USER_EMAIL}, phone=${USER_PHONE}...`);
    let userDoc = await UserModel.findOne({
      $or: [{ phone: USER_PHONE }, { email: USER_EMAIL }],
    });

    const hashedPassword = await hashPassword(USER_RAW_PASS);

    if (!userDoc) {
      console.log('User does not exist. Creating new user...');
      userDoc = await UserModel.create({
        fullname: USER_FULLNAME,
        phone: USER_PHONE,
        email: USER_EMAIL,
        password: hashedPassword,
        is_verified: true,
        isBlocked: false,
        role: UserRole.USER,
      });
      console.log(`Created user: ${userDoc._id.toString()} (${userDoc.fullname})`);
    } else {
      console.log(`User already exists: ${userDoc._id.toString()}. Updating password & verification...`);
      userDoc.password = hashedPassword;
      userDoc.is_verified = true;
      userDoc.isBlocked = false;
      userDoc.email = USER_EMAIL;
      userDoc.phone = USER_PHONE;
      await userDoc.save();
      console.log(`Updated user: ${userDoc._id.toString()} successfully.`);
    }

    // 2. Define multiple organizations to seed with distinct roles
    const orgsToSeed = [
      {
        name: process.argv[2] ?? 'Future Club',
        slug:
          process.argv[3] ??
          (process.argv[2] ?? 'Future Club')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, ''),
        description: 'Official Future Club events organization',
        role: OrgRole.ADMIN,
      },
      {
        name: 'Where Is My Event',
        slug: 'where-is-my-event',
        description: 'Where Is My Event global organization',
        role: OrgRole.EDITOR,
      },
      {
        name: 'Kerala Tech Community',
        slug: 'kerala-tech-community',
        description: 'Kerala regional tech community organization',
        role: OrgRole.VIEWER,
      },
    ];

    console.log('\n--- Seeding Organizations and User Memberships ---');
    const seededList = [];

    for (const orgData of orgsToSeed) {
      let orgDoc = await OrganizationModel.findOne({
        $or: [{ slug: orgData.slug }, { name: orgData.name }],
      });

      if (!orgDoc) {
        orgDoc = await OrganizationModel.create({
          name: orgData.name,
          slug: orgData.slug,
          description: orgData.description,
          email: USER_EMAIL,
          phone: USER_PHONE,
          is_active: true,
        });
        console.log(`Created organization: ${orgDoc.name} (${orgDoc._id.toString()})`);
      } else {
        console.log(`Organization exists: ${orgDoc.name} (${orgDoc._id.toString()})`);
      }

      let userOrgDoc = await UserOrganizationModel.findOne({
        user_id: userDoc._id,
        organization_id: orgDoc._id,
      });

      if (!userOrgDoc) {
        userOrgDoc = await UserOrganizationModel.create({
          user_id: userDoc._id,
          organization_id: orgDoc._id,
          role: orgData.role,
          is_active: true,
          joined_at: new Date(),
        });
        console.log(`-> Linked user as ${orgData.role} in ${orgDoc.name}`);
      } else {
        userOrgDoc.role = orgData.role;
        userOrgDoc.is_active = true;
        await userOrgDoc.save();
        console.log(`-> Updated user membership to ${orgData.role} in ${orgDoc.name}`);
      }

      // Ensure organization document has members field updated with proper role
      const memberIndex = orgDoc.members.findIndex(
        (m) => m.user_id.toString() === userDoc._id.toString(),
      );
      if (memberIndex >= 0 && orgDoc.members[memberIndex]) {
        orgDoc.members[memberIndex].role = orgData.role;
        orgDoc.members[memberIndex].is_active = true;
      } else {
        orgDoc.members.push({
          user_id: userDoc._id,
          role: orgData.role,
          is_active: true,
          joined_at: new Date(),
        });
      }
      await orgDoc.save();

      seededList.push({
        orgId: orgDoc._id.toString(),
        orgName: orgDoc.name,
        slug: orgDoc.slug,
        role: userOrgDoc.role,
        userOrgId: userOrgDoc._id.toString(),
      });
    }

    // 3. Generate demo tokens if secrets are present
    const accessSecret =
      process.env['ACCESS_TOKEN_SECRET'] ??
      'futureclub_events_platform_access_token_secret_2026_jwt';
    const refreshSecret =
      process.env['REFRESH_TOKEN_SECRET'] ??
      'futureclub_events_platform_refresh_token_secret_2026_jwt';
    process.env['ACCESS_TOKEN_SECRET'] = accessSecret;
    process.env['REFRESH_TOKEN_SECRET'] = refreshSecret;

    const tokenService = new AuthTokenService();
    const tokens = tokenService.issueTokens({
      id: userDoc._id.toString(),
      fullname: userDoc.fullname,
      email: userDoc.email,
      phone: userDoc.phone,
      google_id: userDoc.google_id,
      profile_pic_key: userDoc.profile_pic_key,
      is_verified: userDoc.is_verified,
      isBlocked: userDoc.isBlocked,
      role: userDoc.role,
      created_at: userDoc.created_at,
      updated_at: userDoc.updated_at,
    });

    console.log('\n================ SUCCESS ================');
    console.log('User ID:           ', userDoc._id.toString());
    console.log('User Email:        ', userDoc.email);
    console.log('User Phone:        ', userDoc.phone);
    console.log('User Password:     ', USER_RAW_PASS);
    console.log('\nUser Organizations & Different Roles:');
    for (const item of seededList) {
      console.log(` - [${item.role}] ${item.orgName} (Org ID: ${item.orgId}, Slug: ${item.slug})`);
    }
    console.log('\nSample Access Token (Bearer):');
    console.log(tokens.accessToken);
    console.log('=========================================\n');
  } catch (error) {
    console.error('Script failed with error:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

void run();
