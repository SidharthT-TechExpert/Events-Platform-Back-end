import { OrgRole } from '@/domain/enums/org-role.enum.js';

export class UserOrganization {
  constructor(
    private readonly _id: string | undefined,
    private readonly _user_id: string,
    private readonly _organization_id: string,
    private _role: OrgRole = OrgRole.VIEWER,
    private _is_active: boolean = true,
    private readonly _joined_at: Date = new Date(),
    private readonly _created_at: Date = new Date(),
    private _updated_at: Date = new Date(),
  ) {}

  get id(): string {
    if (!this._id) {
      throw new Error('UserOrganization has not been persisted yet');
    }
    return this._id;
  }

  get user_id(): string {
    return this._user_id;
  }

  get organization_id(): string {
    return this._organization_id;
  }

  get role(): OrgRole {
    return this._role;
  }

  get is_active(): boolean {
    return this._is_active;
  }

  get joined_at(): Date {
    return this._joined_at;
  }

  get created_at(): Date {
    return this._created_at;
  }

  get updated_at(): Date {
    return this._updated_at;
  }

  // CamelCase compatibility getters
  get userId(): string {
    return this._user_id;
  }

  get organizationId(): string {
    return this._organization_id;
  }

  get isActive(): boolean {
    return this._is_active;
  }

  get joinedAt(): Date {
    return this._joined_at;
  }

  get createdAt(): Date {
    return this._created_at;
  }

  get updatedAt(): Date {
    return this._updated_at;
  }

  // Domain invariants
  changeRole(newRole: OrgRole): void {
    this._role = newRole;
    this._updated_at = new Date();
  }

  activate(): void {
    this._is_active = true;
    this._updated_at = new Date();
  }

  deactivate(): void {
    this._is_active = false;
    this._updated_at = new Date();
  }

  toJSON(): {
    id: string;
    user_id: string;
    organization_id: string;
    role: OrgRole;
    is_active: boolean;
    joined_at: Date;
    created_at: Date;
    updated_at: Date;
  } {
    return {
      id: this.id,
      user_id: this._user_id,
      organization_id: this._organization_id,
      role: this._role,
      is_active: this._is_active,
      joined_at: this._joined_at,
      created_at: this._created_at,
      updated_at: this._updated_at,
    };
  }
}
