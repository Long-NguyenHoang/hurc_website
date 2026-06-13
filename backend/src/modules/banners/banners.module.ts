import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from 'common/entities/banners.entity';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Banner]),
    MediaModule
  ],
  controllers: [BannersController],
  providers: [BannersService],
})
export class BannersModule { }
