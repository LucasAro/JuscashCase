const express = require( 'express' );
const { Op } = require( 'sequelize' );
const Publicacao = require( '../models/Publicacao' );
const autenticarToken = require( '../middleware/auth' ); // Importa o middleware

const router = express.Router();

// Buscar publicações com filtros (rota protegida)
router.get( '/', autenticarToken, async ( req, res ) =>
{
	const { processo, data, status, envolvido } = req.query;

	const where = {};

	if ( processo ) where.processo = processo;
	if ( data ) where.data_disponibilizacao = data;
	if ( status ) where.status = status;

	if ( envolvido )
	{
		where[Op.or] = [
			{ autores: { [Op.iLike]: `%${envolvido}%` } },
			{ advogados: { [Op.iLike]: `%${envolvido}%` } },
			{ reu: { [Op.iLike]: `%${envolvido}%` } },
		];
	}

	try
	{
		const publicacoes = await Publicacao.findAll( { where } );
		res.json( publicacoes );
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

