import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { validateEnv } from './config/env';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminApprovalsModule } from './modules/admin-approvals/admin-approvals.module';
import { AdminTripsModule } from './modules/admin-trips/admin-trips.module';
import { DestinationsModule } from './modules/destinations/destinations.module';
import { GroupTripsModule } from './modules/group-trips/group-trips.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SchoolTripsModule } from './modules/school-trips/school-trips.module';
import { TripsModule } from './modules/trips/trips.module';
import { UsersModule } from './modules/users/users.module';
import { ContactModule } from './modules/contact/contact.module';
import { MailModule } from './modules/mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';
import { StatsModule } from './stats/stats.module';
import { AiTripsModule } from './modules/ai-trips/ai-trips.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { EventsModule } from './modules/events/events.module';

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
    DatabaseModule,
    PrismaModule,
    MailModule,
    AuthModule,
    AdminApprovalsModule,
    AdminTripsModule,
    DestinationsModule,
    GroupTripsModule,
    ReviewsModule,
    SchoolTripsModule,
    TripsModule,
    UsersModule,
    ContactModule,
    StatsModule,
    AiTripsModule,
    BookingsModule,
    EventsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
