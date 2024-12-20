const express = require( 'express' );
const bcrypt = require( 'bcrypt' );
const jwt = require( 'jsonwebtoken' );
const Usuario = require( '../models/Usuario' );
const autenticarToken = require( '../middleware/auth' ); // Importa o middleware
const blacklist = require( '../middleware/blacklist' ); // Middleware de autenticação

const router = express.Router();

// Função para validar e-mail
const validarEmail = ( email ) =>
{
	const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return regex.test( email );
};

// Função para validar senha
const validarSenha = ( senha ) =>
{
	const erros = [];
	if ( senha.length < 8 )
	{
		erros.push( 'A senha deve ter no mínimo 8 caracteres.' );
	}
	if ( !/[A-Z]/.test( senha ) )
	{
		erros.push( 'A senha deve conter pelo menos uma letra maiúscula.' );
	}
	if ( !/[a-z]/.test( senha ) )
	{
		erros.push( 'A senha deve conter pelo menos uma letra minúscula.' );
	}
	if ( !/[0-9]/.test( senha ) )
	{
		erros.push( 'A senha deve conter pelo menos um número.' );
	}
	if ( !/[!@#$%^&*(),.?":{}|<>]/.test( senha ) )
	{
		erros.push( 'A senha deve conter pelo menos um caractere especial.' );
	}
	return erros;
};

// Registro de usuários
router.post( '/register', async ( req, res ) =>
{
	const { nome, email, senha } = req.body;

	if ( !validarEmail( email ) )
	{
		return res.status( 400 ).json( { error: 'O e-mail fornecido é inválido.' } );
	}

	const errosSenha = validarSenha( senha );
	if ( errosSenha.length > 0 )
	{
		return res.status( 400 ).json( { error: 'A senha não atende aos requisitos.', detalhes: errosSenha } );
	}

	try
	{
		const hash = await bcrypt.hash( senha, 10 );
		const usuario = await Usuario.create( { nome, email, senha: hash } );
		res.json( usuario );
	} catch ( error )
	{
		res.status( 500 ).json( { error: 'Erro ao registrar usuário' } );
	}
} );

// Login
router.post( '/login', async ( req, res ) =>
{
	const { email, senha } = req.body;
	try
	{
		const usuario = await Usuario.findOne( { where: { email } } );
		if ( !usuario || !( await bcrypt.compare( senha, usuario.senha ) ) )
		{
			return res.status( 401 ).json( { error: 'Credenciais inválidas' } );
		}
		const token = jwt.sign( { id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1h' } );
		res.json( { token } );
	} catch ( error )
	{
		res.status( 500 ).json( { error: 'Erro ao autenticar usuário' } );
	}
} );

// Validar token
router.post( '/validate', async ( req, res ) =>
{
	autenticarToken( req, res, () =>
	{
		res.status( 200 ).json( { message: 'Token válido' } );
	} );
} );

// Logout
router.post( '/logout', autenticarToken, ( req, res ) =>
{
	const token = req.headers.authorization?.replace( 'Bearer ', '' ); // Captura o token sem o prefixo "Bearer"
	if ( token )
	{
		blacklist.add( token ); // Adiciona o token à blacklist
		res.status( 200 ).json( { message: 'Logout realizado com sucesso' } );
	} else
	{
		res.status( 400 ).json( { error: 'Token não fornecido' } );
	}
} );

module.exports = router;
