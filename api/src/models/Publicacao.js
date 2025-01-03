const { DataTypes } = require( 'sequelize' );
const db = require( '../db' );

const Publicacao = db.define( 'Publicacao', {
	arquivo: DataTypes.STRING,
	data_disponibilizacao: DataTypes.STRING,
	processo: DataTypes.STRING,
	autores: DataTypes.STRING,
	advogados: DataTypes.STRING,
	valor_principal_bruto_liquido: DataTypes.DECIMAL,
	valor_juros_moratorios: DataTypes.DECIMAL,
	valor_honorarios_advocaticios: DataTypes.DECIMAL,
	paragrafo: DataTypes.TEXT,
	reu: DataTypes.STRING,
	status: DataTypes.STRING,
}, {
	tableName: 'documentos',
	underscored: true,
	timestamps: true,
} );

module.exports = Publicacao;
