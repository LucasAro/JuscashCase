// blacklist.js

// Gerencia tokens inválidos na memória (em produção, considere usar Redis ou outro banco de dados)
const tokenBlacklist = new Set();

module.exports = {
	add( token )
	{
		tokenBlacklist.add( token ); // Adiciona o token à blacklist
	},
	has( token )
	{
		return tokenBlacklist.has( token ); // Verifica se o token está na blacklist
	},
};
