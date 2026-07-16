import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ILike, Repository } from 'typeorm';
import { Job } from 'common/entities/jobs.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { slugify } from 'common/utils/slug.util';
import { JobStatus } from 'common/enums';
import { PaginationDto } from 'common/dto/pagination.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) { }

  async create(createJobDto: CreateJobDto, userId: string) {
    let slug = slugify(createJobDto.title);
    const isSlugExist = await this.jobRepository.findOne({ where: { slug } });

    if (isSlugExist) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const newJob = this.jobRepository.create({
      title: createJobDto.title,
      slug,
      department: createJobDto.department,
      location: createJobDto.location,
      job_type: createJobDto.job_type,
      description: createJobDto.description,
      requirements: createJobDto.requirements,
      benefits: createJobDto.benefits,
      deadline: createJobDto.deadline,
      status: createJobDto.status || JobStatus.OPEN,
      created_by_user: { id: userId } as any,
    });

    return await this.jobRepository.save(newJob);
  }

  async findAllPublic(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const [jobs, total] = await this.jobRepository.findAndCount({
      where: { status: JobStatus.OPEN },
      relations: { created_by_user: true },
      select: {
        created_by_user: { id: true, full_name: true },
      },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data: jobs, meta: { total, page, limit, lastPage: Math.ceil(total / limit) } };
  }

  async findAllAdmin(paginationDto: PaginationDto) {
    const { page = 1, limit = 20, search } = paginationDto;
    const [jobs, total] = await this.jobRepository.findAndCount({
      where: search ? { title: ILike(`%${search}%`) } : undefined,
      relations: { created_by_user: true },
      select: {
        created_by_user: { id: true, full_name: true, email: true },
      },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });

    return { data: jobs, meta: { total, page, limit, lastPage: Math.ceil(total / limit) } };
  }

  async findBySlug(slug: string) {
    const job = await this.jobRepository.findOne({
      where: { slug, status: JobStatus.OPEN },
      relations: { created_by_user: true },
      select: {
        created_by_user: { id: true, full_name: true }
      }
    });

    if (!job) throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    return job;
  }

  async findOne(id: string) {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: { created_by_user: true },
    });

    if (!job) throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto) {
    const job = await this.findOne(id);

    if (updateJobDto.title !== undefined) {
      job.title = updateJobDto.title;
      let newSlug = slugify(updateJobDto.title);

      const isSlugExist = await this.jobRepository.findOne({ where: { slug: newSlug } });
      if (isSlugExist && isSlugExist.id !== job.id) {
        newSlug = `${newSlug}-${Date.now().toString().slice(-4)}`;
      }
      job.slug = newSlug;
    }

    if (updateJobDto.department !== undefined) job.department = updateJobDto.department;
    if (updateJobDto.location !== undefined) job.location = updateJobDto.location;
    if (updateJobDto.job_type !== undefined) job.job_type = updateJobDto.job_type;
    if (updateJobDto.description !== undefined) job.description = updateJobDto.description;
    if (updateJobDto.requirements !== undefined) job.requirements = updateJobDto.requirements;
    if (updateJobDto.benefits !== undefined) job.benefits = updateJobDto.benefits;
    if (updateJobDto.deadline !== undefined) job.deadline = updateJobDto.deadline;
    if (updateJobDto.status !== undefined) job.status = updateJobDto.status;

    return await this.jobRepository.save(job);
  }

  async remove(id: string) {
    const job = await this.findOne(id);
    await this.jobRepository.softRemove(job);
    return { message: 'Đã xoá tin tuyển dụng thành công' };
  }
}
