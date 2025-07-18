import { Request, Response, NextFunction } from "express";
import { sendResponse } from "@core/utils";
import { Create } from "./dtos/create.dto";
import message from "@core/config/constants";
import CustomerServices from "./customer.service";

class CustomerController {
    public customerServices = new CustomerServices();
    public create = async (req: Request, res: Response, next: NextFunction) => {
        const model: Create = req.body as Create;
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
}
export default CustomerController;