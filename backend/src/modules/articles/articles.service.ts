import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { LessThanOrEqual, Repository, ILike } from 'typeorm';
import { Article } from 'common/entities/articles.entity';
import { MediaService } from '../media/media.service';
import { slugify } from 'common/utils/slug.util';
import { ArticleStatus } from 'common/enums';
import { PaginationDto } from 'common/dto/pagination.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private readonly mediaService: MediaService,
  ) { }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledArticles() {
    const now = new Date();

    const articlesToPublish = await this.articleRepository.find({
      where: {
        status: ArticleStatus.SCHEDULED,
        published_at: LessThanOrEqual(now),
      },
    });

    if (articlesToPublish.length > 0) {
      this.logger.log(`Tìm thấy ${articlesToPublish.length} bài viết đến giờ đăng...`);

      for (const article of articlesToPublish) {
        article.status = ArticleStatus.PUBLISHED;
        await this.articleRepository.save(article);
        this.logger.log(`Đã xuất bản bài viết: [${article.id}] ${article.title}`);
      }
    }
  }

  async create(createArticleDto: CreateArticleDto, userId: string, file?: Express.Multer.File) {
    let finalThumbnailId = createArticleDto.thumbnail_id;

    if (file) {
      const newMedia = await this.mediaService.uploadSingleFile(file, userId);
      finalThumbnailId = newMedia.id;
    }

    if (!finalThumbnailId) {
      throw new BadRequestException('Vui lòng chọn hình có hoặc tải hình mới');
    }

    let slug = slugify(createArticleDto.title);
    const isSlugExist = await this.articleRepository.findOne({ where: { slug } });
    if (isSlugExist) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // Xử lý tự động gán ngày xuất bản nếu trạng thái là PUBLISHED mà user không truyền vào
    let finalPublishedAt = createArticleDto.published_at ? new Date(createArticleDto.published_at) : null;
    if (createArticleDto.status === ArticleStatus.PUBLISHED && !finalPublishedAt) {
      finalPublishedAt = new Date();
    }

    const newArticle = this.articleRepository.create({
      title: createArticleDto.title,
      slug,
      summary: createArticleDto.summary,
      content: createArticleDto.content,
      status: createArticleDto.status || ArticleStatus.DRAFT,
      published_at: finalPublishedAt,
      thumbnail: { id: finalThumbnailId } as any,
      author: { id: userId } as any,
    });

    return await this.articleRepository.save(newArticle);
  }

  async findAllPublic(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const [articles, total] = await this.articleRepository.findAndCount({
      where: { status: ArticleStatus.PUBLISHED },
      relations: { thumbnail: true, author: true },
      select: {
        thumbnail: { id: true, url: true },
        author: { id: true, full_name: true },
      },
      order: { published_at: 'DESC', created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data: articles, meta: { total, page, limit, lastPage: Math.ceil(total / limit) } };
  }

  async findAllAdmin(paginationDto: PaginationDto) {
    const { page = 1, limit = 20, search } = paginationDto;
    const [articles, total] = await this.articleRepository.findAndCount({
      where: search ? { title: ILike(`%${search}%`) } : undefined,
      relations: { thumbnail: true, author: true },
      select: {
        thumbnail: { id: true, url: true, original_name: true },
        author: { id: true, full_name: true, email: true },
      },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data: articles, meta: { total, page, limit, lastPage: Math.ceil(total / limit) } };
  }

  async findBySlug(slug: string) {
    const article = await this.articleRepository.findOne({
      where: { slug, status: ArticleStatus.PUBLISHED },
      relations: { thumbnail: true, author: true },
      select: {
        thumbnail: { id: true, url: true },
        author: { id: true, full_name: true }
      }
    });

    if (!article) throw new NotFoundException('Không tìm thấy bài viết');
    return article;
  }

  async findOne(id: string) {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: { thumbnail: true, author: true },
    });

    if (!article) throw new NotFoundException("Không tìm thấy bài viết");
    return article;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto, userId: string, file?: Express.Multer.File) {
    const article = await this.findOne(id);

    if (updateArticleDto.title !== undefined) {
      article.title = updateArticleDto.title;
      article.slug = slugify(updateArticleDto.title);
    }
    if (updateArticleDto.summary !== undefined) article.summary = updateArticleDto.summary;
    if (updateArticleDto.content !== undefined) article.content = updateArticleDto.content;

    // Logic cập nhật trạng thái và ngày xuất bản
    if (updateArticleDto.status !== undefined) {
      article.status = updateArticleDto.status;
      // Nếu đổi thành PUBLISHED mà chưa có ngày xuất bản -> Gán ngày hiện tại
      if (article.status === ArticleStatus.PUBLISHED && !article.published_at) {
        article.published_at = new Date();
      }
    }
    if (updateArticleDto.published_at !== undefined) {
      article.published_at = new Date(updateArticleDto.published_at);
    }

    if (file) {
      const newMedia = await this.mediaService.uploadSingleFile(file, userId);
      article.thumbnail = { id: newMedia.id } as any;
    } else if (updateArticleDto.thumbnail_id) {
      article.thumbnail = { id: updateArticleDto.thumbnail_id } as any;
    }

    return await this.articleRepository.save(article);
  }

  async remove(id: string) {
    const article = await this.findOne(id);

    article.thumbnail = null;
    await this.articleRepository.save(article);
    await this.articleRepository.softRemove(article);

    return { message: 'Đã xoá bài viết thành công' };
  }
}
