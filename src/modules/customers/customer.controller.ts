import { Request, Response, NextFunction } from "express";
import { sendResponse } from "@core/utils";
import { Create } from "./dtos/create.dto";
import message from "@core/config/constants";
import CustomerServices from "./customer.service";
import { Update } from "./dtos/update.dto";

class CustomerController {
    public customerServices = new CustomerServices();
    public create = async (req: Request, res: Response, next: NextFunction) => {
        const model: Create = req.body as Create;
        model.created_id = req.id;
        model.seller_id = req.seller_id;
        try {
            const result = await this.customerServices.create(model);
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
        const model: Update = req.body as Update;
        model.customer_id = req.params.id as any;
        model.created_id = req.id;
        model.seller_id = req.seller_id;
        try {
            const result = await this.customerServices.update(model);
            if (result instanceof Error && result.field)
                return sendResponse(res, result.status, result.message, null, result.field);
            if (result instanceof Error)
                return sendResponse(res, result.status, result.message);
            return sendResponse(res, 200, message.UPDATE_SUCCESS, result);
        } catch (error) {
            next(error);
        }
    }   

    public getDetail = async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id as any;
        const created_id = req.id;
        const seller_id = req.seller_id;
        try {
            const result = await this.customerServices.getDetail(id, created_id, seller_id);
            if (result instanceof Error && result.field)
                return sendResponse(res, result.status, result.message, null, result.field);
            if (result instanceof Error)
                return sendResponse(res, result.status, result.message);
            return sendResponse(res, 200, message.GET_DETAIL_SUCCESS, result);
        } catch (error) {
            next(error);
        }
    }   

    public search = async (req: Request, res: Response, next: NextFunction) => {
        const seller_id = req.seller_id as number;
        const created_id = req.id as number;
        const role = req.role_id as number[];
        const {page, limit, created_by, key, group_id} = req.query as any;
        try {
            const result = await this.customerServices.search(seller_id, created_id, role, key, created_by, group_id, page, limit);
            if (result instanceof Error && result.field)
                return sendResponse(res, result.status, result.message, null, result.field);
            if (result instanceof Error)
                return sendResponse(res, result.status, result.message);
            return sendResponse(res, 200, message.GET_DETAIL_SUCCESS, result);
        } catch (error) {
            next(error);
        }
    }   
}
export default CustomerController;