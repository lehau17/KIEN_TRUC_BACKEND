import { InternalServerErrorException } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import {
  scan,
  delayWhen,
  catchError,
  timeout,
  retryWhen,
  delay,
} from 'rxjs/operators';

export function handleRetryWithBackoff<T>(
  maxRetries: number,
  initialTimeout: number,
): (source: Observable<T>) => Observable<T> {
  return (source: Observable<T>) =>
    source.pipe(
      timeout(initialTimeout), // Timeout nếu không nhận được phản hồi sau thời gian này
      retryWhen((errors) =>
        errors.pipe(
          scan((retryCount, error) => {
            // Kiểm tra nếu đã retry tối đa hoặc lỗi không phải từ server thì không retry
            if (retryCount >= maxRetries || !isRetryableError(error)) {
              throw error;
            }
            return retryCount + 1;
          }, 0),
          delayWhen((retryCount) => {
            const delayTime = initialTimeout * Math.pow(2, retryCount - 1); // Backoff với độ trễ tăng dần
            console.log('Retry attempt', retryCount);
            return of(null).pipe(delay(delayTime));
          }),
        ),
      ),
      catchError((err) => {
        // Bắt lỗi và xử lý chúng
        throw err; // Ném lại lỗi nếu cần hoặc xử lý theo cách khác
      }),
    );
}

function isRetryableError(error: any): boolean {
  if (error instanceof Error) {
    // Nếu là lỗi Timeout (ví dụ: từ `timeout()`), có thể retry lại
    if (error.message && error.message.includes('Timeout')) {
      return true;
    }
    if (error.message && error.message.includes('no matching')) {
      return true;
    }
  }
  if (typeof error === 'string' && error.includes('no matching')) {
    return true;
  }

  // Kiểm tra lỗi HTTP 5xx từ server
  return error && error.status >= 500 && error.status < 600;
}
