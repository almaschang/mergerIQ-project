import React, { useEffect, useRef } from 'react';

interface FinancialsWidgetProps {
  symbol: string;
}

export default function FinancialsWidget({ symbol }: FinancialsWidgetProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-financials.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      isTransparent: false,
      largeChartUrl: "",
      displayMode: "regular",
      width: "100%",
      height: 550,
      colorTheme: "light",
      symbol: symbol,
      locale: "en"
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol]);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}