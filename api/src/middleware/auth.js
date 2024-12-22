const jwt = require( 'jsonwebtoken' );
const blacklist = require( './blacklist' );

const autenticarToken = ( req, res, next ) =>
{
	const token = req.headers['authorization'];
	if ( !token )
	{
		return res.status( 401 ).json( { error: 'Token não fornecido' } );
	}

	const tokenSemBearer = token.replace( 'Bearer ', '' );

	if ( blacklist.has( tokenSemBearer ) )
	{
		return res.status( 401 ).json( { error: 'Token inválido ou expirado' } );
	}

	try
	{
		const decoded = jwt.verify( tokenSemBearer, process.env.JWT_SECRET );
		req.user = decoded;
		next();
	} catch ( err )
	{
		res.status( 401 ).json( { error: 'Token inválido ou expirado' } );
	}
};

module.exports = autenticarToken;
