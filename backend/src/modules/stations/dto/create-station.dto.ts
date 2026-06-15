import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateStationDto {
    @IsNotEmpty({ message: 'Tên ga không được để trống' })
    @IsString()
    name: string;

    @IsNotEmpty({ message: 'Mã ga không được để trống' })
    @IsString()
    code: string;

    @IsNotEmpty({ message: 'Nội dung hiển thị không được để trống' })
    @IsString()
    content: string;

    @IsOptional()
    @IsUUID('all', { message: 'ID hình ảnh lịch chạy tàu không hợp lệ' })
    schedule_image_id?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    display_order?: number;
}