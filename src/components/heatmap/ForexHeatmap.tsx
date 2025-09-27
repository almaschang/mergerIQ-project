import React, { useEffect, useRef, memo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ForexHeatmapProps {
  selectedCurrencies: string[];
}

function ForexHeatmap({ selectedCurrencies }: ForexHeatmapProps) {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = '';

    // Generate pairs from selected currencies
    const pairs = selectedCurrencies.flatMap((base, i) =>
      selectedCurrencies.slice(i + 1).map(quote => `${base}${quote}`)
    );

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-forex-heat-map.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: 600,
      currencies: selectedCurrencies,
      isTransparent: false,
      colorTheme: theme,
      locale: "en",
      showBorder: false,
      displayMode: "relative",
      autosize: true
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [selectedCurrencies, theme]);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

export default memo(ForexHeatmap);