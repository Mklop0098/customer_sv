import { IsDateString, IsEmail, IsIn, IsISO8601, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";
import { IsBeforeToday } from "@core/utils/checkBirthDate";

export class Update {
    name?: string;

    @IsEmail({}, { message: 'Email không đúng định dạng' })
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    @Matches(/^(0|\+84)[0-9]{9,10}$/, { message: 'Số điện thoại không đúng định dạng' })
    phone?: string;

    created_id?: number
    customer_id?: number

    seller_id?: number
    transaction_code?: string
    @IsString()
    @IsOptional()
    @Matches(/^.{8}$/, { message: 'Mã phải có đúng 8 ký tự' })
    code?: string

    @IsString()
    @IsOptional()
    @IsIn(['MALE', 'FEMALE', 'OTHER'], { message: 'Giới tính không hợp lệ' })
    gender?: string

    @IsOptional()
    @IsBeforeToday({ message: 'Ngày sinh phải nhỏ hơn ngày hiện tại' })
    birthdate?: string
    nickname?: string
    group_id?: number
    publish?: number

    city_id?: number
    ward_id?: number
    address?: string
    old_address?: string
    address_type?: string

    constructor(email?: string, name?: string, phone?: string, created_id?: number, customer_id?: number, seller_id?: number, transaction_code?: string, code?: string, gender?: string, birthdate?: string, nickname?: string, group_id?: number, publish?: number, city_id?: number, ward_id?: number, address?: string, old_address?: string, address_type?: string) {
        this.email = email;
        this.name = name;
        this.phone = phone;
        this.created_id = created_id;
        this.customer_id = customer_id;
        this.seller_id = seller_id;
        this.transaction_code = transaction_code
        this.code = code
        this.gender = gender
        this.birthdate = birthdate
        this.nickname = nickname
        this.group_id = group_id
        this.publish = publish
        this.city_id = city_id
        this.ward_id = ward_id
        this.address = address
        this.old_address = old_address
        this.address_type = address_type
    }
}
