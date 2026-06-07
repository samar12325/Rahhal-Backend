import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPool } from 'mysql2/promise';

export const MYSQL_POOL = Symbol('MYSQL_POOL');

@Global()
@Module({
  providers: [
    {
      provide: MYSQL_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const pool = createPool({
          host: configService.get<string>('DB_HOST', '127.0.0.1'),
          port: configService.get<number>('DB_PORT', 3306),
          user: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASS') || undefined,
          database: configService.get<string>('DB_NAME', 'rahhal'),
          waitForConnections: true,
          connectionLimit: configService.get<number>('DB_POOL_LIMIT', 10),
          dateStrings: false,
          namedPlaceholders: true,
        });

        return pool;
      },
    },
  ],
  exports: [MYSQL_POOL],
})
export class DatabaseModule {}
