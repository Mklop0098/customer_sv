'use strict';
let tablename = 'customer_address';

exports.up = function(db, callback) {
  return db.addColumn(tablename, 'old_address', { type: 'text' }, function (err) {
    if (err) {
      console.log(err);
      return callback(err);
    }
    return callback();
  });
};

exports.down = function(db, callback) {
  return db.removeColumn(tablename, 'old_address', function (err) {
    if (err) {
      console.log(err);
      return callback(err);
    }
    return callback();
  });
};
