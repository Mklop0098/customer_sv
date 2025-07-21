import database from '@core/config/database';
import HttpException from '@core/exceptions/http.exception';
import { PoolConnection } from 'mysql2/promise';


type TransactionCallback<T> = (conn: PoolConnection) => Promise<T>;

export async function withTransaction<T>(
  callback: TransactionCallback<T>,
  existingConn?: PoolConnection
): Promise<T> {
  let conn: PoolConnection = existingConn!;
  let ownConnection = false;

  try {
    if (!conn) {
      conn = await database.getConnection();
      ownConnection = true;
    }

    await conn.beginTransaction();

    const result = await callback(conn);

    await conn.commit();

    return result;
  } catch (err: any) {
    await conn.rollback();
    throw new HttpException(400, err.message || 'Transaction failed');
  } finally {
    if (ownConnection && conn) {
      conn.release();
    }
  }
}