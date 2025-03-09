import { SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// Define a custom decorator for roles
export const Roles = Reflector.createDecorator<string[]>();
