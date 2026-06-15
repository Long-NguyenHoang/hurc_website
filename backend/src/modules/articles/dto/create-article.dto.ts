import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { ArticleStatus } from "common/enums";

export class CreateArticleDto {
    @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    summary?: string;

    @IsNotEmpty({ message: 'Nội dung bài viết không được để trống' })
    @IsString()
    content: string;

    @IsOptional()
    @IsUUID('all', { message: 'ID ảnh đại diện không hợp lệ' })
    thumbnail_id?: string;

    @IsOptional()
    @IsEnum(ArticleStatus, { message: 'Trạng thái bài viết không hợp lệ' })
    status?: ArticleStatus;

    @IsOptional()
    @IsDateString({}, { message: 'Ngày xuất bản không đúng định dạng (ISO 8601)' })
    published_at?: string;
}
