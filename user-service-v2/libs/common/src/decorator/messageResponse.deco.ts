import { SetMetadata } from '@nestjs/common';
import { MessageResponse } from '../constraint';

export const MESSAGE_DECORATOR = 'message';

export const MessageDeco = (messageType: MessageResponse) =>
  SetMetadata(MESSAGE_DECORATOR, messageType);
