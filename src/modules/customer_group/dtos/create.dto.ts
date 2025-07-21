import { IsIn, IsNotEmpty, IsOptional, IsString, IsNumber } from "class-validator";

export class Create {
    @IsString()
    @IsNotEmpty({ message: 'Tên nhóm không được để trống' })
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsNotEmpty({ message: 'Người tạo không được để trống' })
    created_id?: number;

    @IsNumber()
    @IsNotEmpty({ message: 'Người bán không được để trống' })
    seller_id?: number;

    @IsNumber()
    @IsOptional()
    publish?: number;

    @IsNumber()
    @IsOptional()
    is_default?: number;

    @IsString()
    @IsOptional()
    @IsIn(['PERCENT', 'FIXED'], { message: 'Loại chiết khấu không hợp lệ' })
    discount_type?: string;

    @IsNumber()
    @IsOptional()
    discount_value?: number;

    group_id?: number;
    transaction_code?: string;

    constructor(name: string, created_id: number, seller_id: number, description?: string, publish?: number, is_default?: number, discount_type?: string, discount_value?: number, group_id?: number, transaction_code?: string) {
        this.name = name;
        this.created_id = created_id;
        this.seller_id = seller_id;
        this.description = description;
        this.publish = publish;
        this.is_default = is_default;
        this.discount_type = discount_type;
        this.discount_value = discount_value;
        this.group_id = group_id;
        this.transaction_code = transaction_code;
    }
} 