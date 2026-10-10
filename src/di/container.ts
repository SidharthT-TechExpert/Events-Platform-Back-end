import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types.js';

import type { IUserRepository } from '@/repositories/interfaces/user.repository.interface.js';
import { UserRepository } from '@/repositories/implementations/user.repository.js';
import type { IOrganizationRepository } from '@/repositories/interfaces/organization.repository.interface.js';
import { OrganizationRepository } from '@/repositories/implementations/organization.repository.js';
import type { IUserOrganizationRepository } from '@/repositories/interfaces/user-organization.repository.interface.js';
import { UserOrganizationRepository } from '@/repositories/implementations/user-organization.repository.js';

import type { IOtpService } from '@/services/interfaces/otp.service.interface.js';
import { RedisOtpService } from '@/services/shared/redis-otp.service.js';

import type { IAuthService } from '@/services/interfaces/auth.service.interface.js';
import { AuthService } from '@/services/auth/auth.service.js';
import type { IAuthTokenService } from '@/services/interfaces/auth-token.service.interface.js';
import { AuthTokenService } from '@/services/auth/auth-token.service.js';
import { AuthController } from '@/controllers/auth.controller.js';

import type { IOrganizationService } from '@/services/interfaces/organization.service.interface.js';
import { OrganizationService } from '@/services/organization/organization.service.js';
import { OrganizationController } from '@/controllers/organization.controller.js';

import type { IUnitOfWork } from '@/infrastructure/unit-of-work/unit-of-work.interface.js';
import { MongoUnitOfWork } from '@/infrastructure/unit-of-work/mongo-unit-of-work.js';

export const container = new Container({ defaultScope: 'Singleton' });

// Bind Repositories
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<IOrganizationRepository>(TYPES.OrganizationRepository).to(OrganizationRepository);
container
  .bind<IUserOrganizationRepository>(TYPES.UserOrganizationRepository)
  .to(UserOrganizationRepository);

// Bind Services
container.bind<IOtpService>(TYPES.OtpService).to(RedisOtpService);
container.bind<IUnitOfWork>(TYPES.UnitOfWork).to(MongoUnitOfWork);
container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
container.bind<IAuthTokenService>(TYPES.AuthTokenService).to(AuthTokenService);
container.bind<IOrganizationService>(TYPES.OrganizationService).to(OrganizationService);

// Bind Controllers
container.bind<AuthController>(TYPES.AuthController).to(AuthController);
container.bind<OrganizationController>(TYPES.OrganizationController).to(OrganizationController);
