import { Transform, Type } from "class-transformer";
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateTicketFareDto {
    @IsNotEmpty({ message: 'Tiêu đề giá vé không được để trống' })
    @IsString()
    title: string;

    @IsOptional()
    @IsUUID('all', { message: 'ID hình ảnh không hợp lệ' })
    image_id?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    display_order?: number;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    is_active?: boolean;

}