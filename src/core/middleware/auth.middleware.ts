import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { sendResponse } from '@core/utils';
import { checkExist } from '@core/utils/checkExist';
import errorMessages from '@core/config/constants';
import { getUrlAction } from '@core/utils/getUrlAction';
class AuthMiddleware {
    public static authorization(isCheckPermission = false) {
        if (isCheckPermission == false) {
            return this.authorizationWithPermissionCheck(false);
        } else {
            return this.authorizationWithPermissionCheck(true);
        }
    }
    public static authorizationWithPermissionCheck = (isCheckPermission: boolean) => {
        return async (req: Request, res: Response, next: NextFunction) => {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            if (!token) {
                return sendResponse(res, 401, 'Vui lòng đăng nhập');
            }
            let { url, action } = getUrlAction(req);
            if (req.header('url')) {
                url = req.header('url') as string;
            }
            if (req.header('action')) {
                action = req.header('url') as string;
            }
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
                if (decoded && typeof decoded === 'object' && 'id' in decoded) {
                    const check = await checkExist('accounts', 'id', decoded.id.toString());
                    if (!check) {
                        return sendResponse(res, 401, 'Tài khoản không tồn tại');
                    }
                    if (check[0].active === 0) {
                        return sendResponse(res, 423, errorMessages.USER_BLOCKED);
                    }
                    req.id = check[0].id;
                    req.seller_id = check[0].seller_id;
                    req.ref_id = check[0].ref_id;
                    req.type = check[0].type;
                    next();
                } else {
                    return sendResponse(res, 403, 'Token không hợp lệ');
                }
            } catch (error) {
                return sendResponse(res, 401, error instanceof Error ? error.message : 'Xác thực token thất bại');
            }
        };
    };

}

export default AuthMiddleware;
