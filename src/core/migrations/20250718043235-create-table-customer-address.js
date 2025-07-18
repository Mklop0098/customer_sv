'use strict';
let tableName = 'customer_address';

exports.up = function (db, callback) {
  db.createTable(tableName, {
    id: { type: 'int', notNull: true, autoIncrement: true, primaryKey: true },
    customer_id: { type: 'int', notNull: true }, 
    name: { type: 'varchar(255)', notNull: true }, 
    phone: { type: 'varchar(10)', notNull: true }, 
    city_id: { type: 'int', notNull: true },  
    ward_id: { type: 'int', notNull: true }, 
    address: { type: 'varchar(255)', notNull: true }, 
    address_type: { type: 'enum("NHA_RIENG", "VAN_PHONG", "KHAC")', defaultValue: 'NHA_RIENG' }, 
    is_default: { type: 'tinyint', defaultValue: 0 },
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
