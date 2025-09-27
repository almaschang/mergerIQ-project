import React, { useEffect, useRef } from 'react';
import { ExchangeType } from '../../types/market';
import { EXCHANGE_OPTIONS } from '../../utils/market/exchangeOptions';
import { useTheme } from '../../contexts/ThemeContext';

interface TradingViewScreenerProps {
  selectedExchanges: ExchangeType[];
}

export default function TradingViewScreener({ selectedExchanges }: TradingViewScreenerProps) {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = '';

    // Get all exchange codes for selected exchanges
    const allExchanges = selectedExchanges.flatMap(id => {
      const exchange = EXCHANGE_OPTIONS.find(e => e.id === id);
      return exchange ? exchange.exchanges : [];
    });

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: "100%",
      defaultColumn: "overview",
      defaultScreen: "general",
      market: selectedExchanges[0] || "usa",
      showToolbar: true,
      colorTheme: theme,
      locale: "en",
      exchanges: allExchanges,
      largeChartUrl: ""
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [selectedExchanges, theme]);

  return (
    <div className="tradingview-widget-container h-full" ref={container}>
      <div className="tradingview-widget-container__widget h-full"></div>
    </div>
  );
}