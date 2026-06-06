import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { validateEnv } from './config/env';
import { AuthModule } from './modules/auth/auth.module';
import { DestinationsModule } from './modules/destinations/destinations.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: () => validateEnv(),
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
      },
    }),
    PrismaModule,
    AuthModule,
    DestinationsModule,
    ReviewsModule,
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
