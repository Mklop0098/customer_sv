import { IsBeforeToday } from "@core/utils/checkBirthDate";
import { IsEmail, IsIn, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from "class-validator";

export class Create {

    @IsString()
    @IsNotEmpty({ message: 'Tên không được để trống' })
    name?: string;

    @IsEmail({}, { message: 'Email không đúng định dạng' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email?: string;

    @IsString()
    @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
    @Matches(/^(0|\+84)[0-9]{9,10}$/, { message: 'Số điện thoại không đúng định dạng' })
    phone?: string;

    created_id?: number

    customer_id?: number
    seller_id?: number
    text_password?: string
    transaction_code?: string
    code?: string
    @IsString()
    @IsOptional()
    @IsIn(['MALE', 'FEMALE', 'OTHER'], { message: 'Giới tính không hợp lệ' })
    gender?: string
    
    @IsISO8601({ strict: true }, { message: 'Ngày sinh phải đúng định dạng YYYY-MM-DD'})
    @IsOptional()
    @IsBeforeToday({ message: 'Ngày sinh phải nhỏ hơn ngày hiện tại' })
    birthdate?: string
    nickname?: string
    group_id?: number
    publish?: number

    @IsNumber({}, { message: 'Vui lòng chọn thành phố' })
    city_id?: number
    @IsNumber({}, { message: 'Vui lòng chọn quận/huyện' })
    ward_id?: number
    @IsString({ message: 'Vui lòng nhập địa chỉ' })
    address?: string
    old_address?: string

    constructor(email: string, name: string, phone: string, created_id?: number, customer_id?: number, seller_id?: number, text_password?: string, transaction_code?: string) {
        this.email = email;
        this.name = name;
        this.phone = phone;
        this.created_id = created_id;
        this.customer_id = customer_id;
        this.seller_id = seller_id;
        this.text_password = text_password
        this.transaction_code = transaction_code
    }
}
