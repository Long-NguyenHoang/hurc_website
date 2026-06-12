import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Mật khẩu phải từ 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
    })
    password?: string;

    @IsOptional()
    @IsString({ message: 'Họ tên phải là chuỗi văn bản' })
    full_name?: string;
}