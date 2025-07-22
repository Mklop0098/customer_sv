import { HttpException } from "@core/exceptions";
import database from "@core/config/database";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { Create } from "./dtos/create.dto";
import { checkExistConn } from "@core/utils/checkExist";
import errorMessages from "@core/config/constants";
import EventStorageService from "@modules/event_storage/service";
import { generateCodeConn } from "@core/utils/gennerate.code";
import CustomerAddressServices from "@modules/customer_address/customer_address.service";
import { Update } from "./dtos/update.dto";
import moment from "moment";
import { enrichCustomerAddresses } from "./ultils";
import { Query } from "mysql2/typings/mysql/lib/protocol/sequences/Query";
import { caculatePagination } from "@core/utils/caculatePagination";
class CustomerServices {
    private tableName = 'customers';
    private eventStorageService = new EventStorageService();
    private customerAddressService = new CustomerAddressServices();

    public create = async (model: Create) => {
        const conn = await database.getConnection();
        try {
            await conn.beginTransaction();
            const [checkPhone] = await conn.query<RowDataPacket[]>(`SELECT id FROM ${this.tableName} WHERE phone = ? and seller_id = ? and created_id = ?`, [model.phone!, model.seller_id!, model.created_id!]);
            console.log(checkPhone);
            if (checkPhone.length > 0) {
                throw new HttpException(400, errorMessages.PHONE_EXISTED, 'phone');
            }
            if (model.email != undefined) {
                const [checkEmail] = await conn.query<RowDataPacket[]>(`SELECT id FROM ${this.tableName} WHERE email = ? and seller_id = ? and created_id = ?`, [model.email, model.seller_id!, model.created_id!]);
                if (checkEmail.length > 0) {
                    throw new HttpException(400, errorMessages.EMAIL_EXISTED, 'email');
                }
            }
            let code
            if (model.code) {
                const [existCode] = await conn.query<RowDataPacket[]>(`SELECT id FROM ${this.tableName} WHERE code = ? AND seller_id = ? AND created_id = ?`, [model.code, model.seller_id!, model.created_id!]);
                console.log(existCode);
                if (existCode.length > 0) {
                    throw new HttpException(400, errorMessages.CODE_EXISTED, 'code');
                }
                code = model.code
            }
            else {
                code = await generateCodeConn(conn, 8, model.seller_id!, model.created_id!)
            }
            const query = `
                    INSERT INTO ${this.tableName} 
                    (name, code, phone, email, gender, birthdate, nickname, group_id, publish, created_id, seller_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
            const values = [
                model.name,
                code,
                model.phone,
                model.email,
                model.gender || "OTHER",
                model.birthdate || null,
                model.nickname || null,
                model.group_id || 1,
                model.publish || 1,
                model.created_id || null,
                model.seller_id || null
            ]
            const [result] = await conn.query<ResultSetHeader>(query, values);
            const insert = result.insertId
            await this.customerAddressService.create({
                customer_id: insert,
                ...model,
                transaction_code: model.transaction_code
            }, conn)
            await conn.commit();
            return {
                data: {
                    id: insert,
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

    public update = async (model: Update) => {
        console.log(model);
        const conn = await database.getConnection();
        try {
            await conn.beginTransaction();
            const exist = await checkExistConn(conn, this.tableName, 'id', model.customer_id!);
            let insert
            if (!exist) {
                let code = model.code || await generateCodeConn(conn, 8)
                const query = `
                    INSERT INTO ${this.tableName} 
                    (name, code, phone, email, gender, birthdate, nickname, group_id, publish) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                const values = [
                    model.name,
                    code,
                    model.phone,
                    model.email,
                    model.gender || "OTHER",
                    model.birthdate || null,
                    model.nickname || null,
                    model.group_id || 1,
                    model.publish || 1
                ]
                const [result] = await conn.query<ResultSetHeader>(query, values);
                insert = result.insertId
                await this.eventStorageService.create(conn, {
                    table_name: this.tableName,
                    event_type: 'create',
                    data: {
                        id: insert
                    },
                    transaction_code: model.transaction_code,
                })
                if (model.address) {
                    await this.customerAddressService.create({
                        customer_id: insert,
                        name: model.name,
                        phone: model.phone,
                        ...model.address,
                        is_default: 1,
                        transaction_code: model.transaction_code
                    }, conn)
                }
            }
            else {
                // update
                let query = `
                    UPDATE ${this.tableName} 
                    SET updated_at = NOW()
                `;
                const values: any[] = []
                if (model.code) {
                    query += `, code = ?`;
                    const [existCode] = await conn.query<RowDataPacket[]>(`SELECT id FROM ${this.tableName} WHERE code = ? AND id != ?`, [model.code, model.customer_id]);
                    if (existCode.length > 0) {
                        throw new HttpException(400, errorMessages.CODE_EXISTED, 'code');
                    }
                    values.push(model.code)
                }
                if (model.name) {
                    query += `, name = ?`;
                    values.push(model.name)
                }
                if (model.email) {
                    query += `, email = ?`;
                    values.push(model.email)
                }
                if (model.phone) {
                    query += `, phone = ?`;
                    values.push(model.phone)
                }
                if (model.gender) {
                    query += `, gender = ?`;
                    values.push(model.gender)
                }
                if (model.birthdate) {
                    query += `, birthdate = ?`;
                    values.push(model.birthdate)
                }
                if (model.nickname) {
                    query += `, nickname = ?`;
                    values.push(model.nickname)
                }
                if (model.created_id) {
                    query += `, created_id = ?`;
                    values.push(model.created_id)
                }
                if (model.seller_id) {
                    query += `, seller_id = ?`;
                    values.push(model.seller_id)
                }
                if (model.group_id) {
                    query += `, group_id = ?`;
                    values.push(model.group_id)
                }
                if (model.publish) {
                    query += `, publish = ?`;
                    values.push(model.publish)
                }
                query += ` WHERE id = ?`;
                values.push(model.customer_id)
                const [result] = await conn.query<ResultSetHeader>(query, values);
                if (result.affectedRows < 1) {
                    throw new HttpException(400, errorMessages.UPDATE_FAILED, 'update');
                }
                const [defaultAddress] = await conn.query<RowDataPacket[]>(`SELECT id FROM customer_address WHERE customer_id = ? AND is_default = 1`, [model.customer_id]);
                if (model.address) {
                    if (defaultAddress.length < 1) {
                        await this.customerAddressService.create({
                            customer_id: model.customer_id,
                            name: model.name,
                            phone: model.phone,
                            ...model.address,
                            is_default: 1,
                            transaction_code: model.transaction_code
                        }, conn)
                    }
                    else {
                        await this.customerAddressService.update({
                            address_id: defaultAddress[0].id,
                            name: model.name,
                            phone: model.phone,
                            ...model.address,
                            seller_id: model.seller_id,
                            customer_id: model.customer_id,
                            transaction_code: model.transaction_code
                        }, conn)
                    }
                }
                await this.eventStorageService.create(conn, {
                    table_name: this.tableName,
                    event_type: 'update',
                    data: {
                        ...exist[0],
                        birthdate: moment(exist[0].birthdate).format('YYYY-MM-DD'),
                        created_at: moment(exist[0].created_at).format('YYYY-MM-DD HH:mm:ss'),
                        updated_at: moment(exist[0].updated_at).format('YYYY-MM-DD HH:mm:ss')
                    },
                    transaction_code: model.transaction_code,
                })
            }

            await conn.commit();
            if (!exist) {
                return {
                    data: {
                        id: insert
                    }
                }
            }
        } catch (error: any) {
            await conn.rollback();
            return new HttpException(400, error.message);
        } finally {
            conn.release();
        }
    }

    public getDetail = async (id: number, created_id?: number, seller_id?: number) => {
        const conn = await database.getConnection();
        try {
            await conn.beginTransaction();

            const [result] = await conn.query<RowDataPacket[]>(`
                SELECT
                    c.id,
                    c.code,
                    c.name,
                    c.phone,
                    c.email,
                    c.gender,
                    c.birthdate,
                    c.nickname,
                    c.group_id,
                    IFNULL(
                        CONCAT('[', GROUP_CONCAT(
                            JSON_OBJECT(
                                'id', ca.id,
                                'name', ca.name,
                                'phone', ca.phone,
                                'city_id', ca.city_id,
                                'ward_id', ca.ward_id,
                                'address', ca.address,
                                'address_type', ca.address_type,
                                'is_default', ca.is_default,
                                'old_address', ca.old_address
                            )
                        ), ']'),
                        '[]'
                    ) AS customer_address
                FROM ${this.tableName} c
                LEFT JOIN customer_address ca ON ca.customer_id = c.id
                WHERE c.id = ? 
                ${created_id ? `AND c.created_id = ?` : ''}
                ${seller_id ? `AND c.seller_id = ?` : ''}
                GROUP BY c.id
            `, [id, created_id, seller_id]);

            if (result.length < 1) {
                throw new HttpException(400, errorMessages.NOT_FOUND, 'id');
            }

            // ✅ Tái sử dụng hàm xử lý địa chỉ
            const [customer] = await enrichCustomerAddresses(result);

            await conn.commit();
            return {
                data: customer
            };
        } catch (error: any) {
            await conn.rollback();
            return new HttpException(400, error.message);
        } finally {
            conn.release();
        }
    }

    public search = async (seller_id: number, created_id: number, role: number[], key: string, created_by: string, group_id: number, page: number, limit: number) => {
        const conn = await database.getConnection();
        try {
            await conn.beginTransaction();
            const created_by_list = created_by ? JSON.parse(created_by) : [];
            let query = `
                SELECT
                    c.id,
                    c.code,
                    c.name,
                    c.phone,
                    c.email,
                    c.gender,
                    c.birthdate,
                    c.nickname,
                    c.group_id,
                    IFNULL(
                        CONCAT('[', GROUP_CONCAT(
                            JSON_OBJECT(
                                'id', ca.id,
                                'name', ca.name,
                                'phone', ca.phone,
                                'city_id', ca.city_id,
                                'ward_id', ca.ward_id,
                                'address', ca.address,
                                'address_type', ca.address_type,
                                'is_default', ca.is_default,
                                'old_address', ca.old_address
                            )
                        ), ']'),
                        '[]'
                    ) AS customer_address
                FROM ${this.tableName} c
                LEFT JOIN customer_address ca ON ca.customer_id = c.id
                WHERE 1 = 1 
                ${(!role.includes(3)) ? ` AND c.created_id = ${created_id}` : ''}
                ${created_by_list.length > 0 ? ` AND c.created_id IN (${created_by_list})` : ''}
                ${seller_id ? ` AND c.seller_id = ${seller_id}` : ''}
                ${key ? ` AND (
                    c.name LIKE '%${key}%' OR
                    c.phone LIKE '%${key}%' OR
                    c.email LIKE '%${key}%' OR
                    c.code LIKE '%${key}%' OR
                    c.nickname LIKE '%${key}%'
                )` : ''}
                ${group_id ? ` AND c.group_id = ${group_id}` : ''}
                GROUP BY c.id
            `
            const [count] = await conn.query<RowDataPacket[]>(query);
            if (page && limit) {
                query = query + ` LIMIT ` + limit + ` OFFSET ` + (page - 1) * limit;
            }
            console.log(query)
            const [result] = await conn.query<RowDataPacket[]>(query);

            if (result.length < 1) {
                throw new HttpException(400, errorMessages.NOT_FOUND, 'id');
            }

            const customers = await enrichCustomerAddresses(result);

            await conn.commit();
            return {
                data: customers,
                pagination: caculatePagination(count.length, page, limit)
            };
        } catch (error: any) {
            await conn.rollback();
            return new HttpException(400, error.message);
        } finally {
            conn.release();
        }
    };
}

export default CustomerServices;