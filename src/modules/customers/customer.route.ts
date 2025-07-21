import UserController from "./customer.controller";
import { IRoute } from "@core/interfaces";
import { AuthMiddleware, errorMiddleware } from "@core/middleware";
import { Router } from "express";
import multer from "multer";
import { Create } from "./dtos/create.dto";
import { Update } from "./dtos/update.dto";

class CustomerRoute implements IRoute {
    public path = '/customers';
    public router = Router();
    public upload = multer({ storage: multer.memoryStorage() });

    public userController = new UserController();

    constructor() {
        this.initializeRoutes();
    }
    private initializeRoutes() {
        this.router.post(this.path + '/', AuthMiddleware.authorization(true), errorMiddleware(Create, 'body', false), this.userController.create)
        this.router.put(this.path + '/profile/:id', errorMiddleware(Update, 'body', false), this.userController.update)
        this.router.get(this.path + '/find-by-id/:id', AuthMiddleware.authorization(true), this.userController.getDetail)
        this.router.get(this.path + '/search', AuthMiddleware.authorizationStrict(true), this.userController.search)
    }
}

export default CustomerRoute;   