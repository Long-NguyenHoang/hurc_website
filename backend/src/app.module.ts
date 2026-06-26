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
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    // Config ConfigModule to read file .env
    ConfigModule.forRoot({
      isGlobal: true,   // Read file in every module
      envFilePath: '.env',
    }),

    // THÊM CACHE MODULE VÀO ĐÂY (Lưu cache trong 60 giây)
    CacheModule.register({
      isGlobal: true,
      ttl: 60000, // 60 giây. Trong 1 phút, 1000 người vào thì DB chỉ bị gọi đúng 1 lần!
    }),

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
        // synchronize: true sẽ tự động sync schema database với entity của code.
        // LƯU Ý TỪ SENIOR: Chỉ nên để true ở môi trường DEV (Local).
        // Khi lên Production, BẮT BUỘC phải chuyển thành false và dùng Migration.
        synchronize: true
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
