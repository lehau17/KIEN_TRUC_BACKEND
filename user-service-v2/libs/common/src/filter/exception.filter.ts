import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorMessages, MessageResponse, StatusCodeResponse } from '../constraint';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        console.log('Check exception', exception);
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: any = MessageResponse.SERVER_ERROR;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            message =
                typeof exceptionResponse === 'string'
                    ? exceptionResponse
                    : (exceptionResponse as any).message || message;
        }
        if (Array.isArray(message)) {
            message = ErrorMessages[message[0]] || message[0];
        }

        console.log("check message", message)

        response.status(status).json({
            success: false,
            code: StatusCodeResponse[message],
            message,
            timestamp: new Date().toISOString(),
        });
    }
}
