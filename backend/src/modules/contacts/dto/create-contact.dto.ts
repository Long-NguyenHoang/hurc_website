import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Subject } from "common/enums";

export class CreateContactDto {
    @IsNotEmpty({ message: 'Họ và tên không được để trống' })
    @IsString()
    full_name: string;

    @IsOptional()
    @IsEmail({}, { message: 'Email không đúng định dang' })
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsNotEmpty({ message: 'Chủ đề không được để trống' })
    @IsEnum(Subject, { message: 'Chủ đề liên hệ không hợp lệ' })
    subject: Subject;

    @IsNotEmpty({ message: 'Nội dung tin nhắn không được để trống' })
    @IsString()
    message: string;
}