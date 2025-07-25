import { HttpException } from "@core/exceptions";
import database from "@core/config/database";
import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { Create } from "./dtos/create.dto";
import { checkExistConn } from "@core/utils/checkExist";
import errorMessages from "@core/config/constants";
import EventStorageService from "@modules/event_storage/service";
import { withTransaction } from "@core/utils/withTransaction";

class CustomerAddressServices {
    private tableName = 'customer_address';
    private eventStorageService = new EventStorageService();

    public create = async (model: Create, conn?: PoolConnection) => {
        console.log(model)
        const isExternalConn = !!conn;
        try {
            return await withTransaction(async (trx) => {
                if (model.customer_type == 'CUSTOMER') {
                    model.customer_id = model.ref_id;
                }
                const checkCustomer = await checkExistConn(trx, 'customers', 'id', model.customer_id!, undefined, model.seller_id);
                if (!checkCustomer) {
                    throw new HttpException(400, 'Khách hàng không tồn tại', 'customer_id');
                }

                if (model.is_default == 1) {
                    await trx.query(
                        `UPDATE ${this.tableName} SET is_default = 0 WHERE customer_id = ?`,
                        [model.customer_id]
                    );
                }
                const query = `
                    INSERT INTO ${this.tableName} (customer_id, name, phone, city_id, ward_id, address, address_type, is_default, old_address)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `
                console.log(model, model.old_address)
                const [result] = await trx.query<ResultSetHeader>(query,
                    [
                        model.customer_id,
                        model.name,
                        model.phone,
                        model.city_id,
                        model.ward_id,
                        model.address,
                        model.address_type || 'NHA_RIENG',
                        model.is_default || 1,
                        model.old_address ? `${model.old_address}` : null,
                    ]
                );

                model.transaction_code && await this.eventStorageService.create(trx, {
                    table_name: this.tableName,
                    event_type: 'create',
                    data: { id: result.insertId },
                    transaction_code: model.transaction_code,
                });

                return {
                    data: {
                        id: result.insertId,
                        ...model,
                    },
                };
            }, conn);
        } catch (error: any) {
            if (isExternalConn) throw error;
            return new HttpException(400, error.message || 'Lỗi khi tạo địa chỉ');
        }
    };
    public update = async (model: Create, conn?: PoolConnection) => {
        console.log(model)
        const isExternalConn = !!conn;

        try {
            return await withTransaction(async (trx) => {

                const [exist] = await trx.query<RowDataPacket[]>(
                    `   select c.id, c.seller_id from customers c
                    left join customer_address ca on ca.customer_id = c.id
                    where ca.id = ?
                    `,
                    [model.address_id]
                );
                if (exist.length < 1) {
                    throw new HttpException(400, 'Địa chỉ không tồn tại', 'address_id');
                }
                if (exist[0].seller_id != model.seller_id || exist[0].id != model.customer_id) {
                    throw new HttpException(400, 'Bạn không có quyền thực hiện thao tác này');
                }
                
                if (model.is_default == 1) {
                    await trx.query(
                        `UPDATE ${this.tableName} SET is_default = 0 WHERE customer_id = ? AND id != ?`,
                        [exist[0].customer_id, model.address_id]
                    );
                }
                else if (exist.length == 1) {
                    throw new HttpException(400, 'Phải có một địa chỉ mặc định', 'address_id');
                }
                let query = `UPDATE ${this.tableName} SET updated_at = NOW()`;
                const values: any[] = [];

                if (model.name) query += `, name = ?`, values.push(model.name);
                if (model.phone) query += `, phone = ?`, values.push(model.phone);
                if (model.city_id) query += `, city_id = ?`, values.push(model.city_id);
                if (model.ward_id) query += `, ward_id = ?`, values.push(model.ward_id);
                if (model.address) query += `, address = ?`, values.push(model.address);
                if (model.old_address) query += `, old_address = ?`, values.push(model.old_address);
                if (model.address_type) query += `, address_type = ?`, values.push(model.address_type);
                if (model.is_default !== undefined) query += `, is_default = ?`, values.push(model.is_default);

                query += ` WHERE id = ?`;
                values.push(model.address_id);

                const [result] = await trx.query<ResultSetHeader>(query, values);
                if (result.affectedRows < 1) {
                    throw new HttpException(400, 'Cập nhật thất bại', 'update');
                }

                model.transaction_code && await this.eventStorageService.create(trx, {
                    table_name: this.tableName,
                    event_type: 'update',
                    data: { ...exist[0] },
                    transaction_code: model.transaction_code,
                });

                return {
                    data: {
                        id: model.address_id,
                        ...model,
                    },
                };
            }, conn);
        } catch (error: any) {
            if (isExternalConn) throw error;
            return new HttpException(400, error.message || 'Lỗi khi cập nhật địa chỉ');
        }
    };

    public getByCustomerId = async (customerId: number) => {
        const conn = await database.getConnection();
        try {
            const query = `
                SELECT * FROM ${this.tableName} 
                WHERE customer_id = ? 
                ORDER BY is_default DESC, created_at DESC
            `;
            const [rows] = await conn.query(query, [customerId]);
            return {
                data: rows
            }
        } catch (error: any) {
            return new HttpException(400, error.message);
        } finally {
            conn.release();
        }
    }

    public delete = async (addressId: number, customerId: number, seller_id: number) => {
        console.log(addressId, customerId, seller_id)
        const conn = await database.getConnection();
        try {
            await conn.beginTransaction();
            if (seller_id === customerId) {
                throw new HttpException(400, 'Thiếu thông tin khách hàng');
            }
            const [exist] = await conn.query<RowDataPacket[]>(
                `   select c.id, c.seller_id, ca.is_default from customers c
                    left join customer_address ca on ca.customer_id = c.id
                    where ca.id = ?
                `,
                [addressId]
            );
            if (exist.length < 1) {
                throw new HttpException(400, 'Địa chỉ không tồn tại', 'address_id');
            }
            if (exist[0].seller_id != seller_id || exist[0].id != customerId) {
                throw new HttpException(400, 'Bạn không có quyền thực hiện thao tác này');
            }
            if (exist[0].is_default == 1) {
                throw new HttpException(400, 'Không thể xóa địa chỉ mặc định', 'address_id');
            }
            const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
            const [result] = await conn.query<ResultSetHeader>(query, [addressId]);

            if (result.affectedRows < 1) {
                throw new HttpException(400, 'Xóa địa chỉ thất bại', 'delete');
            }
            await conn.commit();
            return {
                data: {
                    id: addressId
                }
            }
        } catch (error: any) {
            await conn.rollback();
            return new HttpException(400, error.message);
        } finally {
            conn.release();
        }
    }

    // public update = async (addressId: number, customerId: number, seller_id: number) => {
    //     console.log(addressId, customerId, seller_id)
    //     const conn = await database.getConnection();
    //     try {
    //         await conn.beginTransaction();
    //         const [exist] = await conn.query<RowDataPacket[]>(
    //             `   select c.id, c.seller_id from customers c
    //                 left join customer_address ca on ca.customer_id = c.id
    //                 where ca.id = ?
    //             `,
    //             [addressId]
    //         );
    //         if (exist.length < 1) {
    //             throw new HttpException(400, 'Địa chỉ không tồn tại', 'address_id');
    //         }
    //         if (exist[0].seller_id != seller_id || exist[0].id != customerId) {
    //             throw new HttpException(400, 'Bạn không có quyền thực hiện thao tác này');
    //         }
    //         const removeQuery = `UPDATE ${this.tableName} SET is_default = 0 WHERE customer_id = ? AND id != ?`;
    //         await conn.query<ResultSetHeader>(
    //             removeQuery,
    //             [customerId, addressId]
    //         );
    //         const query = `UPDATE ${this.tableName} SET is_default = 1 WHERE id = ?`;
    //         console.log(query, [addressId])
    //         const [result] = await conn.query<ResultSetHeader>(query, [addressId]);
    //         if (result.affectedRows < 1) {
    //             throw new HttpException(400, 'Cập nhật địa chỉ mặc định thất bại', 'update');
    //         }
    //         await conn.commit();
    //         return {
    //             data: {
    //                 id: addressId
    //             }
    //         }
    //     } catch (error: any) {
    //         await conn.rollback();
    //         return new HttpException(400, error.message);
    //     } finally {
    //         conn.release();
    //     }
    // }
}

export default CustomerAddressServices; 