import { IsIn, IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean } from "class-validator";

export class UpdateDto {
    @IsNumber()
    @IsOptional()
    customer_id?: number;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsNumber()
    @IsOptional()
    city_id?: number;

    @IsNumber()
    @IsOptional()
    ward_id?: number;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    @IsIn(['NHA_RIENG', 'VAN_PHONG', 'KHAC'], { message: 'Loại địa chỉ không hợp lệ' })
    address_type?: string;

    @IsBoolean()
    @IsOptional()
    is_default?: boolean;

    address_id?: number;
    transaction_code?: string;

    constructor(customer_id?: number, name?: string, phone?: string, city_id?: number, ward_id?: number, address?: string, address_type?: string, is_default?: boolean, address_id?: number, transaction_code?: string) {
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