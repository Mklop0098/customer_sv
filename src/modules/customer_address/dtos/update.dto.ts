import { IsIn, IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, Matches, Min } from "class-validator";

export class UpdateDto {
    @IsNumber()
    @IsOptional()
    customer_id?: number;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @Matches(/^(0|\+84)[0-9]{9,10}$/, { message: 'Số điện thoại không đúng định dạng' })
    @IsOptional()
    phone?: string;

    @IsNumber()
    @Min(1, { message: 'City ID phải lớn hơn 0' })
    @IsOptional()
    city_id?: number;

    @IsNumber()
    @Min(1, { message: 'Ward ID phải lớn hơn 0' })
    @IsOptional()
    ward_id?: number;

    @IsString({ message: 'Địa chỉ phải là một chuỗi ký tự' })
    @IsOptional()
    address?: string;   

    @IsString()
    @IsOptional()
    @IsIn(['NHA_RIENG', 'VAN_PHONG', 'KHAC'], { message: 'Loại địa chỉ không hợp lệ' })
    address_type?: string;

    @IsNumber()
    @IsIn([0, 1], { message: 'Trạng thái mặc định phải là 0 hoặc 1' })
    @IsOptional()
    is_default?: number;

    address_id?: number;
    transaction_code?: string;

    seller_id?: number;
    ref_id?: number;
    customer_type?: string;


    constructor(customer_id?: number, name?: string, phone?: string, city_id?: number, ward_id?: number, address?: string, address_type?: string, is_default?: number, address_id?: number, transaction_code?: string) {
        this.customer_id = customer_id;
        this.name = name;
        this.phone = phone;
        this.city_id = city_id;
        this.ward_id = ward_id;
        this.address = address;
        this.address_type = address_type;
        this.is_default = is_default;
        this.address_id = address_id;
        this.transaction_code = transaction_code;
    }
} 