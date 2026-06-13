import { Transform, Type } from "class-transformer";
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID } from "class-validator";

export class CreateBannerDto {
    @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
    @IsString()
    title: string;

    // @IsNotEmpty({ message: 'ID Hình ảnh không được để trống' })
    @IsOptional()
    @IsUUID('all', { message: 'ID Hình ảnh không hợp lệ' })
    image_id: string;

    @IsOptional()
    @IsUrl({}, { message: 'Đường dẫn liên kết không đúng định dạng URL' })
    redirect_url?: string;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    display_order?: number;
}
