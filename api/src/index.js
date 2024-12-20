require( 'dotenv' ).config();
const express = require( 'express' );
const cors = require( 'cors' );
const db = require( './db' );
const publicacoesRoutes = require( './routes/publicacoes' );
const usuariosRoutes = require( './routes/usuarios' );

const app = express();
app.use( cors() );
app.use( express.json() );

app.use( '/publicacoes', publicacoesRoutes );
app.use( '/usuarios', usuariosRoutes );

const startServer = async () =>
{
	try
	{
		await db.sync();
		app.listen( 3000, () => console.log( 'API rodando na porta 3000' ) );
	} catch ( error )
	{
		console.error( 'Erro ao conectar ao banco de dados:', error );
	}
};

startServer();
