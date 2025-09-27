import React, { useEffect, useRef, memo } from 'react';

interface TradingViewChartProps {
  symbol: string;
}

function TradingViewChart({ symbol }: TradingViewChartProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "D",
      timezone: "exchange",
      theme: "light",
      style: "0",
      locale: "en",
      allow_symbol_change: true,
      calendar: false,
      withdateranges: true,
      save_image: false,
      details: true,
      hotlist: true,
      support_host: "https://www.tradingview.com",
      width: "100%",
      height: 500
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol]);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Price Chart</h2>
      </div>
      <div 
        className="tradingview-widget-container" 
        ref={container}
        style={{ height: "500px" }}
      >
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
}

export default memo(TradingViewChart);