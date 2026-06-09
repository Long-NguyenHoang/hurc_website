import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // Config ConfigModule to read file .env
    ConfigModule.forRoot({
      isGlobal: true,   // Read file in every module
      envFilePath: '.env',
    }),

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
