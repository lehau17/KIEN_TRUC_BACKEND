export interface FindManyEmployeeDto {
  limit?: number;
  page?: number;
  cursor?: number;
  fullname?: string;
  isActive?: boolean;
  orderBy?: 'fullname' | 'created_at' | 'updated_at' | 'id';
  orderType?: 'ASC' | 'DESC';
}
