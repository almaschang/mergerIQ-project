import useSWR from 'swr';

interface SimilarCompany {
  symbol: string;
  name: string;
  marketCap: number;
}

export function useSimilarCompanies(symbol: string) {
  const { data, error } = useSWR(
    symbol ? ['similar-companies', symbol] : null,
    async () => {
      try {
        // Get peer companies from FMP API
        const response = await fetch(
          `https://financialmodelingprep.com/api/v4/stock_peers?symbol=${symbol}&apikey=c4c1e79bf3f6bb102ae400072a048d27`
        );
        const data = await response.json();
        
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('No peer data available');
        }

        const peerSymbols = data[0].peersList;

        // Get company details for each peer
        const peersDetails = await Promise.all(
          peerSymbols.map(async (peerSymbol: string) => {
            try {
              const profileResponse = await fetch(
                `https://financialmodelingprep.com/api/v3/profile/${peerSymbol}?apikey=c4c1e79bf3f6bb102ae400072a048d27`
              );
              const profiles = await profileResponse.json();
              
              if (!Array.isArray(profiles) || profiles.length === 0) {
                return null;
              }

              const profile = profiles[0];
              return {
                symbol: profile.symbol,
                name: profile.companyName,
                marketCap: profile.mktCap || 0
              };
            } catch {
              return null;
            }
          })
        );

        return peersDetails
          .filter((company): company is SimilarCompany => 
            company !== null && company.symbol !== symbol
          )
          .sort((a, b) => b.marketCap - a.marketCap);
      } catch (error) {
        console.error('Error fetching similar companies:', error);
        return [];
      }
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000 // Cache for 10 minutes
    }
  );

  return {
    similarCompanies: data || [],
    isLoading: !error && !data,
    isError: error
  };
}