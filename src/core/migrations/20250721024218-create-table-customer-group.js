'use strict';
let tableName = 'customer_group';

exports.up = function (db, callback) {
  db.createTable(tableName, {
    id: { type: 'int', notNull: true, autoIncrement: true, primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    seller_id: { type: 'int', notNull: true },
    created_id: { type: 'int', notNull: true },
    publish: { type: 'int', defaultValue: 1 },
    is_default: { type: 'int', defaultValue: 0 },
    discount_type: { type: 'ENUM("PERCENT","FIXED")', defaultValue: 'PERCENT' },
    discount_value: { type: 'decimal(10,2)', defaultValue: 0 },
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
