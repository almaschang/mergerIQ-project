import React, { useEffect, useMemo, useRef } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { ComparisonData } from '../../../types/comparison';

interface ComparisonChartsProps {
  companies: ComparisonData[];
  mainSymbol: string;
}

function toTradingViewSymbol(company: ComparisonData): string {
  if (company.exchange) {
    const trimmed = company.exchange.trim();

    if (trimmed.includes(':')) {
      return trimmed.includes(company.symbol) ? trimmed : `${trimmed}${company.symbol}`;
    }

    return `${trimmed}:${company.symbol}`;
  }

  return company.symbol;
}

export default function ComparisonCharts({ companies, mainSymbol }: ComparisonChartsProps) {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const symbolPairs = useMemo(() => {
    if (!companies.length) {
      return [] as string[][];
    }

    const ordered = [...companies].sort((a, b) => {
      if (a.symbol === mainSymbol) return -1;
      if (b.symbol === mainSymbol) return 1;
      return a.symbol.localeCompare(b.symbol);
    });

    return ordered.map((company) => [toTradingViewSymbol(company), '1M']);
  }, [companies, mainSymbol]);

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = '';

    if (!symbolPairs.length) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: symbolPairs,
      chartOnly: false,
      width: '100%',
      height: 520,
      locale: 'en',
      colorTheme: theme,
      autosize: true,
      showVolume: true,
      showMA: true,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
      scalePosition: 'right',
      scaleMode: 'Normal',
      fontFamily: '-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif',
      fontSize: '11',
      noTimeScale: false,
      valuesTracking: '1',
      changeMode: 'price-and-percent',
      chartType: 'area',
      maLineColor: '#2962FF',
      maLineWidth: 1,
      maLength: 9,
      lineWidth: 2,
      lineType: 0
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbolPairs, theme]);

  if (!companies.length) {
    return (
      <div className="bg-white dark:bg-dark-100 shadow rounded-lg p-6 text-sm text-gray-500 dark:text-gray-400">
        No competitor data available yet.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-100 shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance Comparison</h2>
      <div className="tradingview-widget-container" ref={container}>
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
}
