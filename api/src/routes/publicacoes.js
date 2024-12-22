const express = require( 'express' );
const { Op, Sequelize } = require( 'sequelize' );
const Publicacao = require( '../models/Publicacao' );
const autenticarToken = require( '../middleware/auth' );

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Publicações
 *   description: Gerenciamento de publicações - busca, detalhes e alteração de status.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Publicacao:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID da publicação
 *         processo:
 *           type: string
 *           description: Número do processo
 *         autores:
 *           type: string
 *           description: Nome dos autores
 *         status:
 *           type: string
 *           enum: [nova, lida, processada, concluída]
 *           description: Status da publicação
 *         data_disponibilizacao:
 *           type: string
 *           format: date
 *           description: Data de disponibilização
 */

/**
 * @swagger
 * /publicacoes:
 *   get:
 *     summary: Busca publicações com filtros
 *     tags: [Publicações]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Palavra-chave para busca por número do processo ou nomes de envolvidos
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início no formato YYYY-MM-DD
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim no formato YYYY-MM-DD
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Número de registros a pular (para paginação)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número máximo de registros a retornar
 *     responses:
 *       200:
 *         description: Lista de publicações filtradas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nova:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     publicacoes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Publicacao'
 *       500:
 *         description: Erro interno do servidor
 */
router.get( '/', autenticarToken, async ( req, res ) =>
{
	const { search, dataInicio, dataFim, offset = 0, limit = 30 } = req.query;
	const baseWhere = {};

	if ( search )
	{
		baseWhere[Op.or] = [
			{ processo: { [Op.iLike]: `%${search}%` } },
			{ autores: { [Op.iLike]: `%${search}%` } },
			{ advogados: { [Op.iLike]: `%${search}%` } },
			{ reu: { [Op.iLike]: `%${search}%` } },
		];
	}

	if ( dataInicio && dataFim )
	{
		baseWhere.data_disponibilizacao = {
			[Op.between]: [dataInicio, dataFim],
		};
	} else if ( dataInicio )
	{
		baseWhere.data_disponibilizacao = {
			[Op.gte]: dataInicio,
		};
	} else if ( dataFim )
	{
		baseWhere.data_disponibilizacao = {
			[Op.lte]: dataFim,
		};
	}

	try
	{
		const fetchByStatus = async ( status ) =>
		{
			const where = { ...baseWhere, status };
			const publicacoes = await Publicacao.findAll( {
				where,
				offset: parseInt( offset, 10 ),
				limit: parseInt( limit, 10 ),
				order: [
					[Sequelize.literal( `ABS(DATE_PART('day', data_disponibilizacao - NOW()))` ), 'ASC']
				],
			} );
			const total = await Publicacao.count( { where } );
			return { total, publicacoes };
		};

		const nova = await fetchByStatus( 'nova' );
		const lida = await fetchByStatus( 'lida' );
		const processada = await fetchByStatus( 'processada' );
		const concluida = await fetchByStatus( 'concluída' );

		const resposta = {
			nova: {
				total: nova.total,
				publicacoes: nova.publicacoes,
			},
			lida: {
				total: lida.total,
				publicacoes: lida.publicacoes,
			},
			processada: {
				total: processada.total,
				publicacoes: processada.publicacoes,
			},
			concluida: {
				total: concluida.total,
				publicacoes: concluida.publicacoes,
			},
		};

		res.json( resposta );
	} catch ( error )
	{
		console.error( 'Erro ao buscar publicações:', error );
		res.status( 500 ).json( { error: 'Erro ao buscar publicações' } );
	}
} );


/**
 * @swagger
 * /publicacoes/status:
 *   get:
 *     summary: Obtém o total de publicações por status
 *     tags: [Publicações]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Número de registros a pular (para paginação)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número máximo de registros a retornar
 *     responses:
 *       200:
 *         description: Totais de publicações por status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nova:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     publicacoes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Publicacao'
 *                 lida:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     publicacoes:
 *                       type: array
 *                         items:
 *                           $ref: '#/components/schemas/Publicacao'
 *       500:
 *         description: Erro interno do servidor
 */
router.get( '/status', autenticarToken, async ( req, res ) =>
{
	const { offset = 0, limit = 30 } = req.query;

	try
	{
		const [nova, lida, processada, concluida] = await Promise.all( [
			Publicacao.findAndCountAll( {
				where: { status: 'nova' },
				offset: parseInt( offset, 10 ),
				limit: parseInt( limit, 10 ),
			} ),
			Publicacao.findAndCountAll( {
				where: { status: 'lida' },
				offset: parseInt( offset, 10 ),
				limit: parseInt( limit, 10 ),
			} ),
			Publicacao.findAndCountAll( {
				where: { status: 'processada' },
				offset: parseInt( offset, 10 ),
				limit: parseInt( limit, 10 ),
			} ),
			Publicacao.findAndCountAll( {
				where: { status: 'concluída' },
				offset: parseInt( offset, 10 ),
				limit: parseInt( limit, 10 ),
			} ),
		] );

		res.json( {
			nova: {
				total: nova.count,
				publicacoes: nova.rows,
			},
			lida: {
				total: lida.count,
				publicacoes: lida.rows,
			},
			processada: {
				total: processada.count,
				publicacoes: processada.rows,
			},
			concluida: {
				total: concluida.count,
				publicacoes: concluida.rows,
			},
		} );
	} catch ( error )
	{
		console.error( 'Erro ao buscar publicações por status:', error );
		res.status( 500 ).json( { error: 'Erro ao buscar publicações por status' } );
	}
} );


/**
 * @swagger
 * /publicacoes/{id}:
 *   get:
 *     summary: Busca uma publicação por ID
 *     tags: [Publicações]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da publicação
 *     responses:
 *       200:
 *         description: Publicação encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Publicacao'
 *       404:
 *         description: Publicação não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
// Buscar uma publicação pelo ID
router.get( '/:id', autenticarToken, async ( req, res ) =>
{
	const { id } = req.params;

	try
	{
		const publicacao = await Publicacao.findByPk( id );
		if ( !publicacao )
		{
			return res.status( 404 ).json( { error: 'Publicação não encontrada' } );
		}
		res.json( publicacao );
	} catch ( error )
	{
		console.error( 'Erro ao buscar publicação pelo ID:', error );
		res.status( 500 ).json( { error: 'Erro ao buscar publicação pelo ID' } );
	}
} );



/**
 * @swagger
 * /publicacoes/{id}/status:
 *   put:
 *     summary: Atualiza o status de uma publicação (nova, lida, processada, concluída)
 *     tags: [Publicações]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da publicação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [nova, lida, processada, concluída]
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Publicacao'
 *       404:
 *         description: Publicação não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.put( '/:id/status', autenticarToken, async ( req, res ) =>
{
	const { id } = req.params;
	const { status } = req.body;

	try
	{
		const [rowsUpdated] = await Publicacao.update(
			{ status },
			{ where: { id } }
		);

		if ( rowsUpdated === 0 )
		{
			return res.status( 404 ).json( { error: 'Publicação não encontrada' } );
		}

		const publicacaoAtualizada = await Publicacao.findByPk( id );
		res.json( publicacaoAtualizada );
	} catch ( error )
	{
		console.error( 'Erro ao atualizar status:', error );
		res.status( 500 ).json( { error: 'Erro ao atualizar status' } );
	}
} );




module.exports = router;

