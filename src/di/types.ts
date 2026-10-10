export const TYPES = {
  // Repositories
  UserRepository: Symbol.for('UserRepository'),
  OrganizationRepository: Symbol.for('OrganizationRepository'),
  UserOrganizationRepository: Symbol.for('UserOrganizationRepository'),

  // Services
  AuthService: Symbol.for('AuthService'),
  AuthTokenService: Symbol.for('AuthTokenService'),
  OtpService: Symbol.for('OtpService'),
  UnitOfWork: Symbol.for('UnitOfWork'),
  OrganizationService: Symbol.for('OrganizationService'),

  // Controllers
  AuthController: Symbol.for('AuthController'),
  OrganizationController: Symbol.for('OrganizationController'),
} as const;
