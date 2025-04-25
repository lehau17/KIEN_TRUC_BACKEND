import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch(RpcException)
export class RpcExceptionGatewayFilter
  implements RpcExceptionFilter<RpcException>
{
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    const rpcHost = host.switchToRpc(); // Chuyển sang context RPC
    const response = rpcHost.getContext() as any; // Lấy thông tin phản hồi
    // Lấy lỗi từ RpcException
    const errorResponse = exception.getError() as any;
    const message = errorResponse?.message || 'An unexpected error occurred';
    const code = errorResponse?.statusCode || 500;

    // Trả lại lỗi cho client qua Gateway
    return throwError(() => ({
      statusCode: code,
      message,
      timestamp: new Date().toISOString(),
      log: exception,
    }));
  }
}
