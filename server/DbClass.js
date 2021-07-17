class DbClass {
    constructor() {
        this.pool = require('mysql').createPool({
            connectionLimit: 10,
            host: 'chat-db.czkuabyjl3ag.ap-northeast-2.rds.amazonaws.com',
            user: 'admin',
            password: '12345678',
            database: 'chat_db',
            debug: false
        });
    }
};

var proto = DbClass.prototype;

proto.getPool = function () {
    return this.pool;
};

module.exports = DbClass;