const { DataTypes } = require( 'sequelize' );
const db = require( '../db' );

const Usuario = db.define( 'Usuario', {
	nome: DataTypes.STRING,
	email: DataTypes.STRING,
	senha: DataTypes.STRING,
},
	{
		tableName: 'users',
		underscored: true,
		timestamps: true,
	} );

module.exports = Usuario;
