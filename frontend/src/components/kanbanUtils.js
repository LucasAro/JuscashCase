export const timeFromNow = ( date ) =>
{
	const now = new Date();
	const updatedAt = new Date( date );
	const diffMs = now - updatedAt;

	const minutes = Math.floor( diffMs / ( 1000 * 60 ) );
	const hours = Math.floor( diffMs / ( 1000 * 60 * 60 ) );
	const days = Math.floor( diffMs / ( 1000 * 60 * 60 * 24 ) );

	if ( days > 0 ) return `${days}d`;
	if ( hours > 0 ) return `${hours}h`;
	if ( minutes > 0 ) return `${minutes}m`;
	return "agora";
};

export const updateStatus = async ( id, newStatus ) =>
{
	const token = localStorage.getItem( "token" );
	const apiUrl = process.env.REACT_APP_API_URL;

	try
	{
		const response = await fetch(
			`${apiUrl}/publicacoes/${id}/status`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify( { status: newStatus } ),
			}
		);

		if ( !response.ok )
		{
			throw new Error( "Erro ao atualizar status" );
		}

		return await response.json();
	} catch ( error )
	{
		console.error( "Erro ao atualizar status:", error );
		return null;
	}
};

export const isValidMove = ( source, destination ) =>
{
	const order = ["nova", "lida", "processada", "concluída"];
	const sourceIndex = order.indexOf( source );
	const destinationIndex = order.indexOf( destination );

	if (
		( destinationIndex < sourceIndex &&
			!( source === "processada" && destination === "lida" ) ) ||
		destinationIndex - sourceIndex > 1
	)
	{
		return false;
	}

	return true;
};

export const fetchData = async (
	offset,
	limit,
	columns,
	setColumns,
	setHasMore,
	setOffset,
	setIsLoading,
	hasMore,
	setHasFetchedData,
	filters = {},
	reset = false // Novo parâmetro para redefinir as colunas
) =>
{
	// if (!Object.values(hasMore).some((value) => value)) {
	//   console.warn("Sem mais dados para carregar. Ignorando requisição.");
	//   setIsLoading(false);
	//   return;
	// }

	setIsLoading( true );

	const token = localStorage.getItem( "token" );
	const apiUrl = process.env.REACT_APP_API_URL;

	const queryParams = new URLSearchParams( {
		offset,
		limit,
		...( filters.searchQuery && { search: filters.searchQuery } ),
		...( filters.startDate && { dataInicio: filters.startDate } ),
		...( filters.endDate && { dataFim: filters.endDate } ),
	} );

	try
	{
		const response = await fetch( `${apiUrl}/publicacoes?${queryParams.toString()}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		} );

		if ( !response.ok )
		{
			console.error( "Erro na requisição:", response.status, response.statusText );
			return;
		}

		const data = await response.json();

		const isEmptyResponse =
			!data.nova.publicacoes.length &&
			!data.lida.publicacoes.length &&
			!data.processada.publicacoes.length &&
			!data.concluida.publicacoes.length;

		//   if (isEmptyResponse) {
		// 	console.warn("Nenhuma publicação retornada. Interrompendo novas requisições.");
		// 	setHasFetchedData(false);
		// 	setIsLoading(false);
		// 	return;
		//   }

		const newColumns = {
			nova: reset ? data.nova.publicacoes : [...columns.nova, ...data.nova.publicacoes],
			lida: reset ? data.lida.publicacoes : [...columns.lida, ...data.lida.publicacoes],
			processada: reset ? data.processada.publicacoes : [...columns.processada, ...data.processada.publicacoes],
			concluída: reset ? data.concluida.publicacoes : [...columns.concluída, ...data.concluida.publicacoes],
		};

		const newHasMore = {
			nova: newColumns.nova.length < data.nova.total,
			lida: newColumns.lida.length < data.lida.total,
			processada: newColumns.processada.length < data.processada.total,
			concluída: newColumns.concluída.length < data.concluida.total,
		};

		setColumns( newColumns );
		setHasMore( newHasMore );
		setOffset( ( prevOffset ) => ( reset ? limit : prevOffset + limit ) ); // Reinicia o offset se for um reset
		setHasFetchedData( true );
	} catch ( error )
	{
		console.error( "Erro ao buscar dados:", error );
	} finally
	{
		setIsLoading( false );
	}
};
