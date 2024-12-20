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
	setIsLoading
) =>
{
	// if ( setIsLoading )
	// {
	// 	console.warn( "Já está carregando dados. Ignorando nova chamada." );
	// 	return;
	// }
	setIsLoading( true );

	const token = localStorage.getItem( "token" );
	const apiUrl = process.env.REACT_APP_API_URL;

	try
	{
		const response = await fetch(
			`${apiUrl}/publicacoes/status?offset=${offset}&limit=${limit}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		console.log( "Resposta da API recebida:", response );

		if ( !response.ok )
		{
			console.error( "Erro na requisição:", response.status, response.statusText );
			return;
		}

		const data = await response.json();
		console.log( "Dados recebidos da API:", data );

		if ( !data.nova || !data.lida || !data.processada || !data.concluida )
		{
			console.error( "Resposta da API está incompleta ou formatada incorretamente:", data );
			return;
		}

		const newColumns = {
			nova: [...columns.nova, ...data.nova.publicacoes],
			lida: [...columns.lida, ...data.lida.publicacoes],
			processada: [...columns.processada, ...data.processada.publicacoes],
			concluída: [...columns.concluída, ...data.concluida.publicacoes],
		};

		const newTotals = {
			nova: data.nova.total,
			lida: data.lida.total,
			processada: data.processada.total,
			concluída: data.concluida.total,
		};

		console.log( "Novas colunas:", newColumns );
		console.log( "Novos totais:", newTotals );

		const newHasMore = {
			nova: newColumns.nova.length < newTotals.nova,
			lida: newColumns.lida.length < newTotals.lida,
			processada: newColumns.processada.length < newTotals.processada,
			concluída: newColumns.concluída.length < newTotals.concluída,
		};

		console.log( "Novos valores de hasMore:", newHasMore );

		setColumns( newColumns );
		setHasMore( newHasMore );
		setOffset( ( prevOffset ) => prevOffset + limit );
	} catch ( error )
	{
		console.error( "Erro ao buscar dados:", error );
	} finally
	{
		setIsLoading( false );
	}
};
