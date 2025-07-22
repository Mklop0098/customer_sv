import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class AddressDto {
    @IsNumber({}, { message: 'city_id phải là số' })
    @Min(1, { message: 'city_id phải lớn hơn 0' })
    @IsNotEmpty({ message: 'Vui lòng chọn thành phố' })
    city_id?: number
    @IsNumber({}, { message: 'ward_id phải là số' })
    @Min(1, { message: 'ward_id phải lớn hơn 0' })
    @IsNotEmpty({ message: 'Vui lòng chọn quận/huyện' })
    ward_id?: number
    @IsString({ message: 'address phải là chuỗi' })
    @IsNotEmpty({ message: 'Vui lòng nhập địa chỉ' })
    address?: string
    address_type?: string
    old_address?: string
}