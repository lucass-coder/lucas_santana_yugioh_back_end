const Sequelize = require("sequelize");
const database = require('./db');

const Cards = database.define('cartas', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    url_image: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

module.exports = Cards;
