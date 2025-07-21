import CustomerGroupController from "./customer_group.controller";
import { IRoute } from "@core/interfaces";
import { errorMiddleware } from "@core/middleware";
import { Router } from "express";
import { Create } from "./dtos/create.dto";

class CustomerGroupRoute implements IRoute {
    public path = '/customer-group';
    public router = Router();

    public customerGroupController = new CustomerGroupController();

    constructor() {
        this.initializeRoutes();
    }
    
    private initializeRoutes() {
        this.router.post(this.path + '/', errorMiddleware(Create, 'body', false), this.customerGroupController.create);
        this.router.put(this.path + '/', errorMiddleware(Create, 'body', false), this.customerGroupController.update);
        this.router.get(this.path + '/', this.customerGroupController.getAll);
        this.router.get(this.path + '/:groupId', this.customerGroupController.getById);
        this.router.delete(this.path + '/:groupId', this.customerGroupController.delete);
    }
}

export default CustomerGroupRoute; 