import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { MediaModule } from './modules/media/media.module';
import { BannersModule } from './modules/banners/banners.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { AuthModule } from './modules/auth/auth.module';
import { StationsModule } from './modules/stations/stations.module';
import { TicketFaresModule } from './modules/ticket-fares/ticket-fares.module';
import { Station } from 'common/entities/stations.entity';
import { User } from 'common/entities/users.entity';
import { SeederService } from 'common/database/seeder.service';
import { ClsModule } from 'nestjs-cls';
import { UserContextMiddleware } from 'common/middlewares/user-context.middleware';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    // Config ConfigModule to read file .env
    ConfigModule.forRoot({
      isGlobal: true,   // Read file in every module
      envFilePath: '.env',
    }),


    // RATE LIMITING (Chống Spam)
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 giây
      limit: 3,   // Tối đa 3 requests / 1 IP / 60 giây
    }]),

    ClsModule.forRoot({
      global: true,
      middleware: { mount: true }, // Cho phép CLS nhận diện HTTP Context
    }),

    ScheduleModule.forRoot(),

    // Config TypeOrmModule
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') !== 'production'
      }),
    }),
    TypeOrmModule.forFeature([User, Station]),

    UsersModule,

    MediaModule,

    BannersModule,

    ArticlesModule,

    JobsModule,

    ContactsModule,

    AuthModule,

    StationsModule,

    TicketFaresModule,

    AuditLogsModule,

    InvoicesModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeederService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
