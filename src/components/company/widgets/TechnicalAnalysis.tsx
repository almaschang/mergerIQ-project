import React, { useEffect, useRef } from 'react';

interface TechnicalAnalysisProps {
  symbol: string;
}

export default function TechnicalAnalysis({ symbol }: TechnicalAnalysisProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      interval: "1h",
      width: "100%",
      isTransparent: false,
      height: "600",
      symbol: symbol,
      showIntervalTabs: true,
      displayMode: "multiple",
      locale: "en",
      colorTheme: "light"
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
      <div className="tradingview-widget-container__widget" style={{ height: "600px" }}></div>
    </div>
  );
}