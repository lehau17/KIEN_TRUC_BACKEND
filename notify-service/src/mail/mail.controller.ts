import { Controller } from '@nestjs/common';
import { MailService } from './mail.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @EventPattern('sendMail')
  async sendMail(
    @Payload()
    {
      to,
      subject,
      template,
      context,
    }: {
      to: string[];
      subject: string;
      template: string;
      context?: Record<string, any>;
    },
  ) {
    await this.mailService.sendEmail(to, subject, template, context);
    return { message: 'Email sent successfully' };
  }
}
