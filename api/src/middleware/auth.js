const jwt = require( 'jsonwebtoken' );
const blacklist = require( './blacklist' ); // Importa o gerenciador da blacklist

const autenticarToken = ( req, res, next ) =>
{
	const token = req.headers['authorization']; // Captura o token do cabeçalho Authorization
	if ( !token )
	{
		return res.status( 401 ).json( { error: 'Token não fornecido' } );
	}

	const tokenSemBearer = token.replace( 'Bearer ', '' ); // Remove o prefixo 'Bearer ', se presente

	// Verifica se o token está na blacklist
	if ( blacklist.has( tokenSemBearer ) )
	{
		return res.status( 401 ).json( { error: 'Token inválido ou expirado' } );
	}

	try
	{
		const decoded = jwt.verify( tokenSemBearer, process.env.JWT_SECRET ); // Verifica o token
		req.user = decoded; // Armazena as informações do token no objeto req
		next(); // Chama a próxima função no ciclo de middleware
	} catch ( err )
	{
		res.status( 401 ).json( { error: 'Token inválido ou expirado' } );
	}
};

module.exports = autenticarToken;
