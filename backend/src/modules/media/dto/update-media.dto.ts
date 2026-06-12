import { IsNotEmpty, IsString } from "class-validator";


export class UpdateMediaDto {
    @IsNotEmpty({ message: 'Tên file không được để trống' })
    @IsString()
    original_name: string;
}
