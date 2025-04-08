export interface FindManyRoleDto {
  limit?: number;

  page?: number;

  cursor?: number;

  role?: string;

  isActive?: boolean;

  orderBy?: 'role' | 'created_at' | 'updated_at' | 'id';

  orderType?: 'ASC' | 'DESC';
}
