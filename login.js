const Sequelize = require("sequelize");
const database = require('./db');

const Login = database.define('usuario', {
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    senha: {
        type: Sequelize.STRING,
        allowNull: false
    },
    nome: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

module.exports = Login;
