import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Query, UseGuards, Request } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { PaginationDto } from 'common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from 'common/decorators/roles.decorator';
import { UserRole } from 'common/enums';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }


  @Get()
  findAllPublic(@Query() paginationDto: PaginationDto) {
    return this.jobsService.findAllPublic(paginationDto);
  }


  @Get('details/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.jobsService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Post()
  create(@Request() req, @Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Get('admin/all')
  findAllAdmin(@Query() paginationDto: PaginationDto) {
    return this.jobsService.findAllAdmin(paginationDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Get('admin/:id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.update(id, updateJobDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }
}
