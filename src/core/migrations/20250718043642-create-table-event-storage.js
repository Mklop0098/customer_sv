'use strict';
let tableName = 'event_storage';

exports.up = function (db, callback) {
  db.createTable(tableName, {
    id: { type: 'int', notNull: true, autoIncrement: true, primaryKey: true },
    table_name: { type: 'varchar(50)', notNull: true },
    event_type: { type: 'varchar(50)', notNull: true },
    data: { type: 'json', notNull: true },
    transaction_code: { type: 'varchar(50)', notNull: true },
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
