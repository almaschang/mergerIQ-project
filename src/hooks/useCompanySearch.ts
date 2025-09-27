import { useState } from 'react';
import useSWR from 'swr';
import { searchCompanies } from '../utils/market/companySearch';
import { CompanySearchResult } from '../types/company';

export function useCompanySearch() {
  const [query, setQuery] = useState('');
  const { data, error } = useSWR(
    query.trim() ? ['company-search', query] : null,
    () => searchCompanies(query),
    { 
      revalidateOnFocus: false,
      dedupingInterval: 10000 // Cache results for 10 seconds
    }
  );

  return {
    results: data || [],
    isLoading: !error && query.trim() && !data,
    isError: error,
    setQuery
  };
}