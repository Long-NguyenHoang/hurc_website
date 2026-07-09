import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Repository, ILike } from 'typeorm';
import { Banner } from 'common/entities/banners.entity';
import { MediaService } from '../media/media.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
    private readonly mediaService: MediaService,
  ) { }

  async create(createBannerDto: CreateBannerDto, userId: string, file?: Express.Multer.File) {
    let finalImageId = createBannerDto.image_id;

    if (file) {
      const newMedia = await this.mediaService.uploadSingleFile(file, userId);
      finalImageId = newMedia.id;
    }

    if (!finalImageId) {
      throw new BadRequestException('Vui lòng cung cấp hình có sẵn hoặc tải lên một hình mới');
    }

    const newBanner = this.bannerRepository.create({
      title: createBannerDto.title,
      redirect_url: createBannerDto.redirect_url,
      is_active: createBannerDto.is_active,
      display_order: createBannerDto.display_order,
      image: { id: finalImageId } as any,
      created_by_user: { id: userId } as any,
    });

    return await this.bannerRepository.save(newBanner);
  }

  async findAll(isPublic: boolean = false, search?: string) {
    const whereCondition: any = isPublic ? { is_active: true } : {};
    if (search) {
      whereCondition.title = ILike(`%${search}%`);
    }
    return await this.bannerRepository.find({
      where: whereCondition,
      order: {
        display_order: 'ASC',
        created_at: 'DESC',
      },
      relations: { image: true, created_by_user: true },
      select: {
        image: { id: true, url: true, original_name: true },
        created_by_user: { id: true, full_name: true, email: true },
      }
    });
  }

  async findOne(id: string) {
    const banner = await this.bannerRepository.findOne({
      where: { id },
      relations: { image: true, created_by_user: true },
      select: {
        image: { id: true, url: true, original_name: true },
        created_by_user: { id: true, full_name: true, email: true },
      },
    });

    if (!banner) throw new NotFoundException('Không tìm thấy Banner này');

    return banner;
  }

  async update(id: string, updateBannerDto: UpdateBannerDto, userId: string, file?: Express.Multer.File) {
    const banner = await this.findOne(id);

    if (updateBannerDto.title !== undefined) banner.title = updateBannerDto.title;
    if (updateBannerDto.redirect_url !== undefined) banner.redirect_url = updateBannerDto.redirect_url;
    if (updateBannerDto.is_active !== undefined) banner.is_active = updateBannerDto.is_active;
    if (updateBannerDto.display_order !== undefined) banner.display_order = updateBannerDto.display_order;

    if (file) {
      const newMedia = await this.mediaService.uploadSingleFile(file, userId);
      banner.image = { id: newMedia.id } as any;
    } else if (updateBannerDto.image_id) {
      banner.image = { id: updateBannerDto.image_id } as any;
    }

    return await this.bannerRepository.save(banner);
  }

  async remove(id: string) {
    const banner = await this.findOne(id);

    banner.image = null;
    await this.bannerRepository.save(banner);
    await this.bannerRepository.softRemove(banner);

    return { message: 'Đã xoá Banner thành công' };
  }
}
