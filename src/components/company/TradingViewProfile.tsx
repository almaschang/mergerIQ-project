import React, { useEffect, useRef, memo } from 'react';

interface TradingViewProfileProps {
  symbol: string;
}

function TradingViewProfile({ symbol }: TradingViewProfileProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clear previous widget if any
    container.current.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: 300,
      colorTheme: "light",
      isTransparent: false,
      symbol: `${symbol}`,
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
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Additional Information</h2>
      </div>
      <div 
        className="tradingview-widget-container" 
        ref={container}
        style={{ height: "300px" }}
      >
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
}

export default memo(TradingViewProfile);