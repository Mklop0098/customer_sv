import { HttpException } from "@core/exceptions";
import database from "@core/config/database";
import { ResultSetHeader } from "mysql2/promise";
import { Create } from "./dtos/create.dto";
import { checkExistConn } from "@core/utils/checkExist";
import errorMessages from "@core/config/constants";
import EventStorageService from "@modules/event_storage/service";
class CustomerServices {
    private tableName = 'customers';
    private eventStorageService = new EventStorageService();

    public create = async (model: Create) => {
        const conn = await database.getConnection();
        try {
            await conn.beginTransaction();
            const checkPhone = await checkExistConn(conn, this.tableName, 'phone', model.phone!);
            if (checkPhone) {
                throw new HttpException(400, errorMessages.PHONE_EXISTED, 'phone');
            }
            if (model.email != undefined) {
                const checkEmail = await checkExistConn(conn, this.tableName, 'email', model.email);
                if (checkEmail) {
                    throw new HttpException(400, errorMessages.EMAIL_EXISTED, 'email');
                }
            }
            let query = `
                INSERT INTO ${this.tableName} 
                ( name, email, phone, active) 
                VALUES (?, ?, ?, ?)`;
            const values = [
                model.name,
                model.email,
                model.phone,
                model.active || 1,
            ]
            const [result] = await conn.query<ResultSetHeader>(query, values);
            let id = result.insertId
            await this.eventStorageService.create(conn, {
                table_name: this.tableName,
                event_type: 'create',
                data: {
                    id: id
                },
                transaction_code: model.transaction_code,
            })
            await conn.commit();
            return {
                data: {
                    id: id,
                    ...model
                }
            }
        } catch (error: any) {
            await conn.rollback();
            return new HttpException(400, error.message);
        } finally {
            conn.release();
        }
    }
}

export default CustomerServices;