const express = require( 'express' );
const bcrypt = require( 'bcrypt' );
const jwt = require( 'jsonwebtoken' );
const Usuario = require( '../models/Usuario' );
const autenticarToken = require( '../middleware/auth' );
const blacklist = require( '../middleware/blacklist' );

const router = express.Router();

const validarEmail = ( email ) =>
{
	const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return regex.test( email );
};

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
/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Gerenciamento de usuários - registro, login, validação e logout.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID do usuário
 *         nome:
 *           type: string
 *           description: Nome do usuário
 *         email:
 *           type: string
 *           description: Email do usuário
 *         senha:
 *           type: string
 *           description: Senha do usuário (não retorna na resposta)
 */

/**
 * @swagger
 * /usuarios/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do usuário
 *               email:
 *                 type: string
 *                 description: Email do usuário
 *               senha:
 *                 type: string
 *                 description: Senha do usuário
 *     responses:
 *       200:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro no servidor
 */
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
/**
 * @swagger
 * /usuarios/login:
 *   post:
 *     summary: Faz login e retorna um token JWT
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email do usuário
 *               senha:
 *                 type: string
 *                 description: Senha do usuário
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticação
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro no servidor
 */
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

/**
 * @swagger
 * /usuarios/validate:
 *   post:
 *     summary: Valida um token JWT
 *     tags: [Usuários]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *       401:
 *         description: Token inválido ou expirado
 */
router.post( '/validate', async ( req, res ) =>
{
	autenticarToken( req, res, () =>
	{
		res.status( 200 ).json( { message: 'Token válido' } );
	} );
} );

// Logout
/**
 * @swagger
 * /usuarios/logout:
 *   post:
 *     summary: Faz logout do usuário (invalida o token atual)
 *     tags: [Usuários]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *       400:
 *         description: Token não fornecido
 */
router.post( '/logout', autenticarToken, ( req, res ) =>
{
	const token = req.headers.authorization?.replace( 'Bearer ', '' );
	if ( token )
	{
		blacklist.add( token );
		res.status( 200 ).json( { message: 'Logout realizado com sucesso' } );
	} else
	{
		res.status( 400 ).json( { error: 'Token não fornecido' } );
	}
} );

module.exports = router;
