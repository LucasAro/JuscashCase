const tokenBlacklist = new Set();

module.exports = {
	add( token )
	{
		tokenBlacklist.add( token );
	},
	has( token )
	{
		return tokenBlacklist.has( token );
	},
};
