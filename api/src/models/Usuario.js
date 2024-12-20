const { DataTypes } = require( 'sequelize' );
const db = require( '../db' );

const Usuario = db.define( 'Usuario', {
	nome: DataTypes.STRING,
	email: DataTypes.STRING,
	senha: DataTypes.STRING, // Hash da senha será armazenado
},
	{
		tableName: 'users', // Define explicitamente o nome da tabela
		underscored: true, // Configura automaticamente created_at e updated_at
		timestamps: true, // Para usar createdAt e updatedAt
	} );

module.exports = Usuario;
