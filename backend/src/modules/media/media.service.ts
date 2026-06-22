import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'common/dto/pagination.dto';
import { Media } from 'common/entities/media.entity';
import { UserRole } from 'common/enums';
import { DataSource, Repository } from 'typeorm';
import { UpdateMediaDto } from './dto/update-media.dto';
import * as fs from 'fs';
import * as path from 'path';
import { Banner } from 'common/entities/banners.entity';
import { Article } from 'common/entities/articles.entity';
import { Station } from 'common/entities/stations.entity';
import { TicketFare } from 'common/entities/ticket_fare.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly dataSource: DataSource,
  ) { }

  async uploadSingleFile(file: Express.Multer.File, userId: string) {
    const newMedia = this.mediaRepository.create({
      file_name: file.filename,
      original_name: file.originalname,
      mime_type: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      uploaded_by_user: { id: userId } as any,
    });

    // 2. Lưu vào Database và trả về kết quả
    return await this.mediaRepository.save(newMedia);
  }

  async findAll(user: any, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    // const whereCondition: any = {};

    // if (user.role !== UserRole.ADMIN) {
    //   whereCondition.uploaded_by_user = { id: user.id };
    // }

    const [mediaFiles, total] = await this.mediaRepository.findAndCount({
      // where: whereCondition,
      skip: skip,
      take: limit,
      order: { created_at: 'DESC' },
      relations: { uploaded_by_user: true },
      select: {
        uploaded_by_user: { id: true, full_name: true, email: true }
      }
    });

    return {
      data: mediaFiles,
      meta: { total, page, limit, lastPage: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, user: any) {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: { uploaded_by_user: true },
    });

    if (!media) {
      throw new NotFoundException('Không tìm thấy file này');
    }

    if (user.role !== UserRole.ADMIN && media.uploaded_by_user.id !== user.id) {
      throw new ForbiddenException('Bạn không có quyền truy cập file của người khác');
    }

    return media;
  }

  async update(id: string, updateMediaDto: UpdateMediaDto, user: any) {
    const media = await this.findOne(id, user);

    media.original_name = updateMediaDto.original_name;
    return await this.mediaRepository.save(media);
  }

  async remove(id: string, user: any) {
    const media = await this.findOne(id, user);

    const usedInBanners = await this.dataSource.getRepository(Banner).count({
      where: { image: { id } },
      withDeleted: true
    });

    const usedInArticles = await this.dataSource.getRepository(Article).count({
      where: { thumbnail: { id } },
      withDeleted: true
    });

    const usedInStations = await this.dataSource.getRepository(Station).count({
      where: { schedule_image: { id } },
      withDeleted: true
    });

    const usedInTicketFares = await this.dataSource.getRepository(TicketFare).count({
      where: { image: { id } },
      withDeleted: true
    });

    const totalUses = usedInBanners + usedInArticles + usedInStations + usedInTicketFares;

    if (totalUses > 0) {
      throw new ConflictException(
        `Không thể xóa! Hình ảnh này đang được sử dụng.`
      );
    }

    const filePath = path.join(process.cwd(), 'uploads', media.file_name);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Lỗi: Không thể xóa file vật lý tại đường dẫn: ${filePath}`, error)
    }

    await this.mediaRepository.remove(media);
    return { messager: 'Đã xoá file thành công' };
  }
}