import { TestEmailDto } from './dto/test-email.dto';
import { EmailService } from './email.service';
export declare class MailController {
    private readonly emailService;
    constructor(emailService: EmailService);
    sendTestEmail(dto: TestEmailDto): Promise<{
        ok: boolean;
        message: string;
    }>;
}
