import { getCityMap, getWardMap } from "@core/utils/getAddress";
import { PoolConnection, RowDataPacket } from "mysql2/promise";
import moment from "moment";

export const enrichCustomerAddresses = async (customers: any[]) => {
    // Gom tất cả địa chỉ từ nhiều customer
    const allAddresses = customers.flatMap((item: any) =>
        JSON.parse(item.customer_address || '[]')
    );

    const cityIds = [...new Set(allAddresses.map((a: any) => a.city_id))];
    const wardIds = [...new Set(allAddresses.map((a: any) => a.ward_id))];

    const [cityMap, wardMap] = await Promise.all([
        getCityMap(cityIds),
        getWardMap(wardIds),
    ]);

    return customers.map((item: any) => {
        const customerAddress = JSON.parse(item.customer_address || '[]');
        const address = customerAddress.map((addr: any) => ({
            ...addr,
            city_name: cityMap.get(addr.city_id) || null,
            ward_name: wardMap.get(addr.ward_id) || null,
        }));
        return {
            ...item,
            birthdate: item.birthdate ? moment(item.birthdate).format('YYYY-MM-DD') : null,
            customer_address: address,
        };
    });
};

export const checkExistPhoneAndEmail = async (conn: PoolConnection, phone: string, email: string) => {
    try {
        const [result] = await conn.query<RowDataPacket[]>(`SELECT id FROM customers WHERE phone = ? OR email = ?`, [phone, email]);
        return result.length > 0;
    } catch (error) {
        return false;
    }
}