import { IsDateString, IsEmail, IsIn, IsISO8601, IsNotEmpty, IsOptional, IsString, Matches, ValidateNested } from "class-validator";
import { IsBeforeToday } from "@core/utils/checkBirthDate";
import { AddressDto } from "./address.dto";
import { Type } from "class-transformer";

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

    @IsBeforeToday({ message: 'Ngày sinh phải nhỏ hơn ngày hiện tại' })
    @IsISO8601({ strict: true }, { message: 'Ngày sinh phải đúng định dạng YYYY-MM-DD'})
    @IsOptional()
    birthdate?: string
    nickname?: string
    group_id?: number
    publish?: number

    @IsOptional()
    @ValidateNested()
    @Type(() => AddressDto)
    address?: AddressDto;


    constructor(email?: string, name?: string, phone?: string, created_id?: number, customer_id?: number, seller_id?: number, transaction_code?: string, code?: string, gender?: string, birthdate?: string, nickname?: string, group_id?: number, publish?: number, address?: AddressDto) {
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
        this.address = address
    }
}
