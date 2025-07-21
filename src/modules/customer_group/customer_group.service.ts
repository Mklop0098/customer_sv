import { HttpException } from "@core/exceptions";
import database from "@core/config/database";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { Create } from "./dtos/create.dto";
import { checkExistConn } from "@core/utils/checkExist";
import errorMessages from "@core/config/constants";
import EventStorageService from "@modules/event_storage/service";

class CustomerGroupServices {
    private tableName = 'customer_group';
    private eventStorageService = new EventStorageService();

    public create = async (model: Create) => {
        const conn = await database.getConnection();
        try {
            await conn.beginTransaction();
            // Check for duplicate name for the same seller
            const [rows] = await conn.query<RowDataPacket[]>(`SELECT id FROM ${this.tableName} WHERE name = ? AND seller_id = ?`, [model.name, model.seller_id]);
            if (Array.isArray(rows) && rows.length > 0) {
                throw new HttpException(400, 'Tên nhóm đã tồn tại', 'name');
            }
            let query = `INSERT INTO ${this.tableName} (name, description, seller_id, created_id, publish, is_default, discount_type, discount_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const values = [
                model.name,
                model.description || null,
                model.seller_id,
                model.created_id,
                model.publish || 1,
                model.is_default || 0,
                model.discount_type || 'PERCENT',
                model.discount_value || 0
            ];
            const [result] = await conn.query<ResultSetHeader>(query, values);
            let id = result.insertId;
            await this.eventStorageService.create(conn, {
                table_name: this.tableName,
                event_type: 'create',
                data: { id: id },
                transaction_code: model.transaction_code,
            });
            await conn.commit();
            return { data: { id: id, ...model } };
        } catch (error: any) {
            await conn.rollback();
            return new HttpException(400, error.message);
        } finally {
            conn.release();
        }
    }

    public update = async (model: Create) => {
        const conn = await database.getConnection();
        try {
            await conn.beginTransaction();
            const exist = await checkExistConn(conn, this.tableName, 'id', model.group_id!);
            if (!exist) {
                throw new HttpException(400, 'Nhóm không tồn tại', 'group_id');
            }
            let query = `UPDATE ${this.tableName} SET updated_at = NOW()`;
            const values: any[] = [];
            if (model.name) { query += `, name = ?`; values.push(model.name); }
            if (model.description) { query += `, description = ?`; values.push(model.description); }
            if (model.seller_id) { query += `, seller_id = ?`; values.push(model.seller_id); }
            if (model.created_id) { query += `, created_id = ?`; values.push(model.created_id); }
            if (model.publish !== undefined) { query += `, publish = ?`; values.push(model.publish); }
            if (model.is_default !== undefined) { query += `, is_default = ?`; values.push(model.is_default); }
            if (model.discount_type) { query += `, discount_type = ?`; values.push(model.discount_type); }
            if (model.discount_value !== undefined) { query += `, discount_value = ?`; values.push(model.discount_value); }
            query += ` WHERE id = ?`;
            values.push(model.group_id);
            const [result] = await conn.query<ResultSetHeader>(query, values);
            if (result.affectedRows < 1) {
                throw new HttpException(400, errorMessages.UPDATE_FAILED, 'update');
            }
            await this.eventStorageService.create(conn, {
                table_name: this.tableName,
                event_type: 'update',
                data: { ...exist[0] },
                transaction_code: model.transaction_code,
            });
            await conn.commit();
            return { data: { id: model.group_id, ...model } };
        } catch (error: any) {
            await conn.rollback();
            return new HttpException(400, error.message);
        } finally {
            conn.release();
        }
    }

    public getAll = async () => {
        const conn = await database.getConnection();
        try {
            const query = `SELECT * FROM ${this.tableName} ORDER BY created_at DESC`;
            const [rows] = await conn.query<RowDataPacket[]>(query);
            return { data: rows };
        } catch (error: any) {
            return new HttpException(400, error.message);
        } finally {
            conn.release();
        }
    }

    public getById = async (groupId: number) => {
        const conn = await database.getConnection();
        try {
            const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
            const [rows] = await conn.query<RowDataPacket[]>(query, [groupId]);
            return { data: Array.isArray(rows) && rows.length > 0 ? rows[0] : null };
        } catch (error: any) {
            return new HttpException(400, error.message);
        } finally {
            conn.release();
        }
    }

    public delete = async (groupId: number, transactionCode?: string) => {
        const conn = await database.getConnection();
        try {
            await conn.beginTransaction();
            const exist = await checkExistConn(conn, this.tableName, 'id', groupId);
            if (!exist) {
                throw new HttpException(400, 'Nhóm không tồn tại', 'group_id');
            }
            const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
            const [result] = await conn.query<ResultSetHeader>(query, [groupId]);
            if (result.affectedRows < 1) {
                throw new HttpException(400, 'Xóa nhóm thất bại', 'delete');
            }
            await this.eventStorageService.create(conn, {
                table_name: this.tableName,
                event_type: 'delete',
                data: { ...exist[0] },
                transaction_code: transactionCode,
            });
            await conn.commit();
            return { data: { id: groupId } };
        } catch (error: any) {
            await conn.rollback();
            return new HttpException(400, error.message);
        } finally {
            conn.release();
        }
    }
}

export default CustomerGroupServices; 