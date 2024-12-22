const swaggerJsDoc = require( 'swagger-jsdoc' );
const swaggerUi = require( 'swagger-ui-express' );

const swaggerOptions = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'API de Publicações e Usuários',
			version: '1.0.0',
			description: 'Documentação da API para gerenciamento de publicações e usuários. Inicie registrando um usuário, faça login para obter um token, e utilize-o para acessar rotas protegidas.',
		},
		servers: [
			{
				url: 'http://localhost:3000',
				description: 'Servidor de Desenvolvimento',
			},
		],
		components: {
			securitySchemes: {
				BearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
			},
		},
		security: [{ BearerAuth: [] }],
	},
	apis: [`${__dirname}/routes/*.js`],
};

const swaggerDocs = swaggerJsDoc( swaggerOptions );

module.exports = { swaggerUi, swaggerDocs };
