import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";
import { UserRole } from "common/enums";

export class CreateUserDto {
    @IsNotEmpty({ message: 'Email không được để trống' })
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    email: string;

    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()])[A-Za-z\d@$!%*?&#^()]{8,}$/, {
        message: 'Mật khẩu phải từ 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
    })
    password: string;

    @IsNotEmpty({ message: 'Họ và tên không được để trống' })
    @IsString()
    full_name: string;

    @IsOptional()
    @IsEnum(UserRole, { message: 'Quyền hạn không hợp lệ' })
    role?: UserRole;

    @IsOptional()
    @IsBoolean({ message: 'Trạng thái hoạt động phải là boolean' })
    is_active?: boolean;
}
