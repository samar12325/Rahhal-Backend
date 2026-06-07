import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  ServiceUnavailableException,
} from '@nestjs/common';
import { TestEmailDto } from './dto/test-email.dto';
import { EmailService } from './email.service';

@Controller('mail')
export class MailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('test')
  async sendTestEmail(@Body() dto: TestEmailDto) {
    if (!this.emailService.getMailConfig()) {
      throw new ServiceUnavailableException('Mail is not configured');
    }

    try {
      await this.emailService.sendEmail(
        dto.email,
        'Test Email From RAHHAL',
        `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Test Email From RAHHAL</h2>
            <p>This is a Gmail SMTP test email from the Rahhal backend.</p>
          </div>
        `,
      );

      return {
        ok: true,
        message: 'Test email sent successfully',
      };
    } catch (error: unknown) {
      throw new InternalServerErrorException(
        this.emailService.extractError(error),
      );
    }
  }
}
