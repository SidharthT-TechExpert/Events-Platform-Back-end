export class Organization {
  constructor(
    private readonly _id: string | undefined,
    private _name: string,
    private _slug: string,
    private _description: string | null = null,
    private _email: string | null = null,
    private _phone: string | null = null,
    private _website: string | null = null,
    private _logo_key: string | null = null,
    private _is_active: boolean = true,
    private readonly _created_at: Date = new Date(),
    private _updated_at: Date = new Date(),
  ) {}

  get id(): string {
    if (!this._id) {
      throw new Error('Organization has not been persisted yet');
    }
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get slug(): string {
    return this._slug;
  }

  get description(): string | null {
    return this._description;
  }

  get email(): string | null {
    return this._email;
  }

  get phone(): string | null {
    return this._phone;
  }

  get website(): string | null {
    return this._website;
  }

  get logo_key(): string | null {
    return this._logo_key;
  }

  get is_active(): boolean {
    return this._is_active;
  }

  get created_at(): Date {
    return this._created_at;
  }

  get updated_at(): Date {
    return this._updated_at;
  }

  // CamelCase compatibility getters
  get isActive(): boolean {
    return this._is_active;
  }

  get logoKey(): string | null {
    return this._logo_key;
  }

  get createdAt(): Date {
    return this._created_at;
  }

  get updatedAt(): Date {
    return this._updated_at;
  }

  // Domain invariants
  activate(): void {
    this._is_active = true;
    this._updated_at = new Date();
  }

  deactivate(): void {
    this._is_active = false;
    this._updated_at = new Date();
  }

  updateDetails(details: {
    name?: string;
    description?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    logo_key?: string | null;
  }): void {
    if (details.name !== undefined) this._name = details.name;
    if (details.description !== undefined) this._description = details.description;
    if (details.email !== undefined) this._email = details.email;
    if (details.phone !== undefined) this._phone = details.phone;
    if (details.website !== undefined) this._website = details.website;
    if (details.logo_key !== undefined) this._logo_key = details.logo_key;
    this._updated_at = new Date();
  }

  toPublicJson(): {
    id: string;
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
  } {
    return {
      id: this.id,
      name: this._name,
      slug: this._slug,
      description: this._description,
      email: this._email,
      phone: this._phone,
      website: this._website,
      logo_key: this._logo_key,
      is_active: this._is_active,
      created_at: this._created_at,
      updated_at: this._updated_at,
    };
  }
}
