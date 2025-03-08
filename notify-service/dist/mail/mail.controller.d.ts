import { MailService } from './mail.service';
export declare class MailController {
    private readonly mailService;
    constructor(mailService: MailService);
    sendMail({ to, subject, template, context, }: {
        to: string[];
        subject: string;
        template: string;
        context?: Record<string, any>;
    }): Promise<{
        message: string;
    }>;
}
