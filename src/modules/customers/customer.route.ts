import UserController from "./customer.controller";
import { IRoute } from "@core/interfaces";
import { errorMiddleware } from "@core/middleware";
import { Router } from "express";
import multer from "multer";
import { Create } from "./dtos/create.dto";

class CustomerRoute implements IRoute {
    public path = '/customers';
    public router = Router();
    public upload = multer({ storage: multer.memoryStorage() });

    public userController = new UserController();

    constructor() {
        this.initializeRoutes();
    }
    private initializeRoutes() {
        this.router.post(this.path + '/', errorMiddleware(Create, 'body', false), this.userController.create)
    }
}

export default CustomerRoute;   