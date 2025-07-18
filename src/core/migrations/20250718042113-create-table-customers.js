'use strict';
let tableName = 'customers';

exports.up = function (db, callback) {
  db.createTable(tableName, {
    id: { type: 'int', notNull: true, autoIncrement: true, primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    code: { type: 'varchar(255)', notNull: true },
    phone: { type: 'varchar(10)', notNull: true },
    email: { type: 'varchar(255)' },
    gender: { type: 'enum("male", "female", "other")', defaultValue: 'other' }, 
    birthdate: { type: 'date' }, 
    nickname: { type: 'varchar(255)' }, 
    created_id: { type: 'int'}, 
    seller_id: { type: 'int' }, 
    is_delete: { type: 'tinyint', defaultValue: 0 },
    group_id: { type: 'int' }, 
    publish: { type: 'tinyint', defaultValue: 1 },
    created_at: { type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP' },
    updated_at: { type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP' },
  }, function (err) {
    if (err) {
      console.error('err create ' + tableName + ' table:', err);
      return callback(err);
    }
    callback();
  });
};
exports.down = function (db, callback) {
  db.dropTable(tableName, function (err) {
    if (err) {
      console.error('err drop ' + tableName + ' table:', err);
      return callback(err);
    }
    callback();
  });
};
