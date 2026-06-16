import { IsEnum, IsNotEmpty } from "class-validator";
import { ContactStatus } from "common/enums";

export class UpdateContactDto {
    @IsNotEmpty({ message: 'Trạng thái xử lý không được để trống' })
    @IsEnum(ContactStatus, { message: 'Trạng thái không hợp lệ' })
    status: ContactStatus;
}
