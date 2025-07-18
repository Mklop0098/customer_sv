import { IsEmail, IsNotEmpty, IsString, Matches } from "class-validator";

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

    active?: number;

    created_id?: number

    manager_id?: number

    role_id?: number
    @IsNotEmpty({ message: 'Vui lòng chọn chi nhánh' })
    branch_id?: number[]

    user_id?: number
    seller_id?: number
    text_password?: string
    transaction_code?: string
    constructor(email: string, name: string, phone: string, active: number, created_id?: number, manager_id?: number, role_id?: number, user_id?: number, seller_id?: number, text_password?: string, branch_id?: number[], transaction_code?: string) {
        this.email = email;
        this.name = name;
        this.phone = phone;
        this.active = active;
        this.created_id = created_id;
        this.manager_id = manager_id;
        this.role_id = role_id;
        this.user_id = user_id;
        this.seller_id = seller_id;
        this.text_password = text_password
        this.branch_id = branch_id
        this.transaction_code = transaction_code
    }
}
