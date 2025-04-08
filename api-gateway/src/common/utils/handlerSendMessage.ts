import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { handleRetryWithBackoff } from './handlerTimeoutWithBackoff';

const handleSendMessage = <T>(
  service: ClientProxy,
  topic: string,
  payload: any,
): Promise<T> => {
  return lastValueFrom(
    service.send(topic, payload).pipe(handleRetryWithBackoff(3, 1000)),
  );
};

export default handleSendMessage;
