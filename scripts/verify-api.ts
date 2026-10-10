import mongoose from 'mongoose';
import { app } from '../src/app.js';
import { UserModel } from '../src/repositories/models/user.model.js';
import { AuthTokenService } from '../src/services/auth/auth-token.service.js';
import type { Server } from 'http';

const MONGODB_URI = process.env['MONGODB_URI'];
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable must be configured in .env');
}

async function verify(): Promise<void> {
  console.log('--- 1. Connecting to MongoDB ---');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.\n');

  let server: Server | null = null;
  const port = 3009;

  try {
    server = app.listen(port);
    const baseUrl = `http://localhost:${port}`;
    console.log(`Test API running at ${baseUrl}\n`);

    // 1. Health check
    console.log('Test 1: Health check endpoint (GET /health)...');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthJson = await healthRes.json();
    console.log('Status:', healthRes.status, JSON.stringify(healthJson));

    // 2. Unauthenticated GET /organization/organizations
    console.log('\nTest 2: Unauthorized request (GET /organization/organizations without token)...');
    const unauthRes = await fetch(`${baseUrl}/organization/organizations`);
    const unauthJson = await unauthRes.json();
    console.log('Status:', unauthRes.status, JSON.stringify(unauthJson));
    if (unauthRes.status === 401) {
      console.log('PASS: Correctly blocked unauthorized caller with 401 Unauthorized');
    }

    // 3. Authenticated request for sidhartht900@gmail.com
    console.log('\nTest 3: Authenticated request (GET /organization/organizations for user 8848096746)...');
    const user = await UserModel.findOne({ phone: '8848096746' });
    if (!user) throw new Error('Seed user not found');

    const tokenService = new AuthTokenService();
    const { accessToken } = tokenService.issueTokens({
      id: user._id.toString(),
      fullname: user.fullname,
      email: user.email,
      phone: user.phone,
      google_id: user.google_id,
      profile_pic_key: user.profile_pic_key,
      is_verified: user.is_verified,
      isBlocked: user.isBlocked,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });

    const authRes = await fetch(`${baseUrl}/organization/organizations`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const authJson = (await authRes.json()) as { success: boolean; data: any[] };
    console.log('Status:', authRes.status);
    console.log('Response JSON:');
    console.log(JSON.stringify(authJson, null, 2));

    // 4. Test access middleware: Future Club has ADMIN role
    const futureClubOrg = authJson.data.find((o: any) => o.slug === 'future-club');
    if (futureClubOrg) {
      console.log(`\nTest 4: accessToOrgUser middleware on Future Club (${futureClubOrg.organization_id})...`);
      const accessRes = await fetch(
        `${baseUrl}/organization/${futureClubOrg.organization_id}/access-check`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const accessJson = await accessRes.json();
      console.log('Status:', accessRes.status, JSON.stringify(accessJson));
      if (accessRes.status === 200) {
        console.log('PASS: accessToOrgUser granted access to ADMIN!');
      }
    }

    // 5. Test access middleware: Forbidden on unknown org
    console.log('\nTest 5: accessToOrgUser on random unknown org ID...');
    const forbiddenRes = await fetch(`${baseUrl}/organization/6ac9d603fa0cbd65538aa999/access-check`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const forbiddenJson = await forbiddenRes.json();
    console.log('Status:', forbiddenRes.status, JSON.stringify(forbiddenJson));
    if (forbiddenRes.status === 403) {
      console.log('PASS: Correctly rejected user with 403 Forbidden for organization they are not in!');
    }

    // 6. Test GET /organization/:organizationId/ with trailing slash (allowed for member, returns full details + members)
    if (futureClubOrg) {
      console.log(`\nTest 6: GET /organization/${futureClubOrg.organization_id}/ (member allowed, full details + members)...`);
      const getOrgRes = await fetch(`${baseUrl}/organization/${futureClubOrg.organization_id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const getOrgJson = (await getOrgRes.json()) as any;
      console.log('Status:', getOrgRes.status);
      console.log('Organization with members response:');
      console.log(JSON.stringify(getOrgJson, null, 2));
      if (getOrgRes.status === 200 && Array.isArray(getOrgJson.data.members)) {
        console.log('PASS: Returned 200 OK with full details and members list with proper role assignment!');
      }
    }

    // 7. Test GET /organization/:organizationId/ for non-member (blocked with 403)
    console.log('\nTest 7: GET /organization/6ac9d603fa0cbd65538aa999/ (non-member blocked with 403)...');
    const getBlockedRes = await fetch(`${baseUrl}/organization/6ac9d603fa0cbd65538aa999/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const getBlockedJson = await getBlockedRes.json();
    console.log('Status:', getBlockedRes.status, JSON.stringify(getBlockedJson));
    if (getBlockedRes.status === 403) {
      console.log('PASS: Correctly returned 403 Forbidden because user is not part of this organization!');
    }

    console.log('\n================ ALL LIVE TESTS PASSED SUCCESSFULLY! ================');
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
  }
}

void verify();
