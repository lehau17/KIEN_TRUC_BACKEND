import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { SentMessageInfo } from 'nodemailer';
import { StateManagement } from 'src/common/stateManagement';
@Injectable()
export class MailService {
    private stateManagement: StateManagement
    constructor(private readonly mailerService: MailerService) {
        this.stateManagement = new StateManagement(3, 2000)
    }

    async sendEmail(
        to: string[],
        subject: string,
        template: string,
        context: Record<string, any>,
    ) {
        this.stateManagement
            .handleRetry<SentMessageInfo, ISendMailOptions>(
                this.mailerService.sendMail.bind(this.mailerService),
                {
                    to,
                    subject,
                    template,
                    context: {
                        ...context,
                        year: new Date().getFullYear(),
                    },
                }).then(e => {
                    console.log("success mail")
                }).catch(e => {
                    console.log("check error", e)
                })
        // this.mailerService.sendMail({
        //     to,
        //     subject,
        //     template,
        //     context: {
        //         ...context,
        //         year: new Date().getFullYear(),
        //     },
        // }).then(() => {
        //     console.log("chinh thuc thanh cong")
        // })
        console.log(`Email sent to ${to}`);
    }
}
