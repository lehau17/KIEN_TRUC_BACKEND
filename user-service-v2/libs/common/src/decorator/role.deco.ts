import { SetMetadata } from '@nestjs/common';

export const ROLE_DECO = 'role';

export const Role = (roleName: string[]) => SetMetadata(ROLE_DECO, roleName);
