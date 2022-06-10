const Sequelize = require("sequelize");

// nome do banco, usuario do banco, senha do banco, options
const sequelize = new Sequelize('pw4', 'root', 'trakinas', {
    dialect: 'mysql',
    host: 'localhost',
    port: 3306
})

module.exports = sequelize;