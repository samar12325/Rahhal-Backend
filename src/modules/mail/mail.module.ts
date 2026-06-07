import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { MailController } from './mail.controller';

@Global()
@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const user = config.get<string>('MAIL_USER');
        const pass = config.get<string>('MAIL_PASS');
        const fromName = config.get<string>('MAIL_FROM_NAME') || 'RAHHAL';

        return {
          transport: {
            service: 'gmail',
            auth: {
              user,
              pass,
            },
          },
          defaults: {
            from: user ? `"${fromName}" <${user}>` : undefined,
          },
        };
      },
    }),
  ],
  controllers: [MailController],
  providers: [EmailService],
  exports: [EmailService, MailerModule],
})
export class MailModule {}
