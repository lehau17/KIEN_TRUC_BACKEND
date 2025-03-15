import { MailerService } from '@nestjs-modules/mailer';
export declare class MailService {
    private readonly mailerService;
    private stateManagement;
    constructor(mailerService: MailerService);
    sendEmail(to: string[], subject: string, template: string, context: Record<string, any>): Promise<void>;
}
