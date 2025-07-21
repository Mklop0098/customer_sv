import { Request, Response, NextFunction } from "express";
import { sendResponse } from "@core/utils";
import { Create } from "./dtos/create.dto";
import message from "@core/config/constants";
import CustomerAddressServices from "./customer_address.service";

class CustomerAddressController {
    public customerAddressServices = new CustomerAddressServices();
    
    public create = async (req: Request, res: Response, next: NextFunction) => {
        const model: Create = req.body as Create;
        model.seller_id = req.seller_id as number;
        model.ref_id = req.ref_id as number;
        model.customer_type = req.type as string;
        try {
            const result = await this.customerAddressServices.create(model);
            if (result instanceof Error && result.field)
                return sendResponse(res, result.status, result.message, null, result.field);
            if (result instanceof Error)
                return sendResponse(res, result.status, result.message);
            return sendResponse(res, 200, message.CREATE_SUCCESS, result);
        } catch (error) {
            next(error);
        }
    }

    public update = async (req: Request, res: Response, next: NextFunction) => {
        const model: Create = req.body as Create;
        try {
            const result = await this.customerAddressServices.update(model);
            if (result instanceof Error && result.field)
                return sendResponse(res, result.status, result.message, null, result.field);
            if (result instanceof Error)
                return sendResponse(res, result.status, result.message);
            return sendResponse(res, 200, message.UPDATE_FAILED, result);
        } catch (error) {
            next(error);
        }
    }

    public getByCustomerId = async (req: Request, res: Response, next: NextFunction) => {
        const customerId = req.params.customerId as any;
        try {
            const result = await this.customerAddressServices.getByCustomerId(customerId);
            if (result instanceof Error)
                return sendResponse(res, result.status, result.message);
            return sendResponse(res, 200, 'Lấy danh sách địa chỉ thành công', result);
        } catch (error) {
            next(error);
        }
    }

    public delete = async (req: Request, res: Response, next: NextFunction) => {
        const addressId = req.params.addressId as any;
        try {
            const result = await this.customerAddressServices.delete(addressId);
            if (result instanceof Error && result.field)
                return sendResponse(res, result.status, result.message, null, result.field);
            if (result instanceof Error)
                return sendResponse(res, result.status, result.message);
            return sendResponse(res, 200, 'Xóa địa chỉ thành công', result);
        } catch (error) {
            next(error);
        }
    }
}

export default CustomerAddressController; 