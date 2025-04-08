import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'public';
export const PublicApi = () => SetMetadata('public', true);
