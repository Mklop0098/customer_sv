import { Request, Response, NextFunction } from "express";
import { sendResponse } from "@core/utils";
import { Create } from "./dtos/create.dto";
import message from "@core/config/constants";
import CustomerGroupServices from "./customer_group.service";

class CustomerGroupController {
    public customerGroupServices = new CustomerGroupServices();

    public create = async (req: Request, res: Response, next: NextFunction) => {
        const model: Create = req.body as Create;
        try {
            const result = await this.customerGroupServices.create(model);
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
            const result = await this.customerGroupServices.update(model);
            if (result instanceof Error && result.field)
                return sendResponse(res, result.status, result.message, null, result.field);
            if (result instanceof Error)
                return sendResponse(res, result.status, result.message);
            return sendResponse(res, 200, message.UPDATE_FAILED, result);
        } catch (error) {
            next(error);
        }
    }

    public getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.customerGroupServices.getAll();
            if (result instanceof Error)
                return sendResponse(res, result.status, result.message);
            return sendResponse(res, 200, 'Lấy danh sách nhóm thành công', result);
        } catch (error) {
            next(error);
        }
    }

    public getById = async (req: Request, res: Response, next: NextFunction) => {
        const groupId = parseInt(req.params.groupId);
        try {
            const result = await this.customerGroupServices.getById(groupId);
            if (result instanceof Error)
                return sendResponse(res, result.status, result.message);
            return sendResponse(res, 200, 'Lấy thông tin nhóm thành công', result);
        } catch (error) {
            next(error);
        }
    }

    public delete = async (req: Request, res: Response, next: NextFunction) => {
        const groupId = parseInt(req.params.groupId);
        const transactionCode = req.body.transaction_code;
        try {
            const result = await this.customerGroupServices.delete(groupId, transactionCode);
            if (result instanceof Error && result.field)
                return sendResponse(res, result.status, result.message, null, result.field);
            if (result instanceof Error)
                return sendResponse(res, result.status, result.message);
            return sendResponse(res, 200, 'Xóa nhóm thành công', result);
        } catch (error) {
            next(error);
        }
    }
}

export default CustomerGroupController; 