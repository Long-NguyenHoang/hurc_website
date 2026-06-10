import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from 'common/entities/jobs.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job])
  ],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule { }
