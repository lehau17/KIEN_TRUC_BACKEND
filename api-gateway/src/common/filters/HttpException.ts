import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    console.log(exception);
    // Kiểm tra nếu exception là một instance của HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const responseBody = exception.getResponse();

      // Nếu response của HttpException là một đối tượng, lấy thông tin message và log
      const message =
        typeof responseBody === 'string'
          ? responseBody
          : responseBody['message'];
      const log = typeof responseBody === 'string' ? '' : responseBody['log'];

      // Trả về chi tiết lỗi
      response.status(status || 500).json({
        timestamp: new Date().toISOString(),
        path: request.url,
        message: message || 'An error occurred', // Message nếu không có trong exception
        // log: log || 'No additional logs', // Log nếu không có trong exception
      });
    } else {
      // Trường hợp không phải HttpException, trả về lỗi mặc định
      response.status(exception.statusCode || 500).json({
        timestamp: new Date().toISOString(),
        path: request.url,
        message:
          exception.error ||
          exception.message ||
          exception ||
          'An unexpected error occurred',
        // log: exception.log || 'No additional logs',
      });
    }
  }
}
