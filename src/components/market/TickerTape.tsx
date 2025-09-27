import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function TickerTape() {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!container.current) return;

    // Clear previous widget if any
    container.current.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "NASDAQ:AAPL", title: "Apple" },
        { proName: "NASDAQ:MSFT", title: "Microsoft" },
        { proName: "NASDAQ:GOOGL", title: "Alphabet" },
        { proName: "NASDAQ:AMZN", title: "Amazon" },
        { proName: "NASDAQ:NVDA", title: "NVIDIA" },
        { proName: "NASDAQ:META", title: "Meta" },
        { proName: "NYSE:BRK.B", title: "Berkshire" },
        { proName: "NASDAQ:TSLA", title: "Tesla" },
        { proName: "NYSE:UNH", title: "UnitedHealth" },
        { proName: "NYSE:JNJ", title: "J&J" }
      ],
      showSymbolLogo: true,
      isTransparent: false,
      displayMode: "adaptive",
      colorTheme: theme,
      locale: "en"
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [theme]);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}