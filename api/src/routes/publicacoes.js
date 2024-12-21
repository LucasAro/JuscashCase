const express = require( 'express' );
const { Op } = require( 'sequelize' );
const Publicacao = require( '../models/Publicacao' );
const autenticarToken = require( '../middleware/auth' ); // Importa o middleware

const router = express.Router();

// Buscar publicações com filtros (rota protegida)
router.get( '/', autenticarToken, async ( req, res ) =>
{
	const { search, dataInicio, dataFim, offset = 0, limit = 30 } = req.query;

	const baseWhere = {};

	// Filtro por "search" (número do processo ou nomes de envolvidos)
	if ( search )
	{
		baseWhere[Op.or] = [
			{ processo: { [Op.iLike]: `%${search}%` } },
			{ autores: { [Op.iLike]: `%${search}%` } },
			{ advogados: { [Op.iLike]: `%${search}%` } },
			{ reu: { [Op.iLike]: `%${search}%` } },
		];
	}

	// Filtros de data para o campo DATE
	if ( dataInicio && dataFim )
	{
		baseWhere.data_disponibilizacao = {
			[Op.between]: [dataInicio, dataFim], // Comparação direta com strings no formato 'YYYY-MM-DD'
		};
	} else if ( dataInicio )
	{
		baseWhere.data_disponibilizacao = {
			[Op.gte]: dataInicio, // Maior ou igual à data inicial
		};
	} else if ( dataFim )
	{
		baseWhere.data_disponibilizacao = {
			[Op.lte]: dataFim, // Menor ou igual à data final
		};
	}

	try
	{
		// Função para buscar publicações por status
		const fetchByStatus = async ( status ) =>
		{
			const where = { ...baseWhere, status };
			const publicacoes = await Publicacao.findAll( {
				where,
				offset: parseInt( offset, 10 ),
				limit: parseInt( limit, 10 ),
			} );
			const total = await Publicacao.count( { where } );
			return { total, publicacoes };
		};

		// Buscar publicações separadamente para cada status
		const nova = await fetchByStatus( 'nova' );
		const lida = await fetchByStatus( 'lida' );
		const processada = await fetchByStatus( 'processada' );
		const concluida = await fetchByStatus( 'concluída' );

		// Organizar a resposta
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



router.put( '/:id/status', autenticarToken, async ( req, res ) =>
{
	const { id } = req.params;
	const { status } = req.body;

	try
	{
		const [rowsUpdated] = await Publicacao.update(
			{ status }, // Campos a serem atualizados
			{ where: { id } } // Condição para encontrar o registro
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

