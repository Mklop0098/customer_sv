import CustomerAddressController from "./customer_address.controller";
import { IRoute } from "@core/interfaces";
import { AuthMiddleware, errorMiddleware } from "@core/middleware";
import { Router } from "express";
import { Create } from "./dtos/create.dto";

class CustomerAddressRoute implements IRoute {
    public path = '/customer-address';
    public router = Router();

    public customerAddressController = new CustomerAddressController();

    constructor() {
        this.initializeRoutes();
    }
    
    private initializeRoutes() {
        this.router.post(this.path + '/',  AuthMiddleware.authorizationStrict(false), errorMiddleware(Create, 'body', false), this.customerAddressController.create);
        this.router.delete(this.path + '/:addressId', this.customerAddressController.delete);
        // this.router.put(this.path + '/', errorMiddleware(Create, 'body', false), this.customerAddressController.update);
        // this.router.get(this.path + '/customer/:customerId', this.customerAddressController.getByCustomerId);
    }
}

export default CustomerAddressRoute; 