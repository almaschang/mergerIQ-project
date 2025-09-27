import React, { useState } from 'react';
import { ExchangeType } from '../../types/market';
import { EXCHANGE_OPTIONS } from '../../utils/market/exchangeOptions';
import ExchangeButton from './ExchangeSelector/ExchangeButton';
import ExchangePopup from './ExchangeSelector/ExchangePopup';

interface ScreenerControlsProps {
  selectedExchanges: ExchangeType[];
  onExchangeToggle: (exchange: ExchangeType) => void;
}

export default function ScreenerControls({
  selectedExchanges,
  onExchangeToggle
}: ScreenerControlsProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <div className="mb-6">
      <ExchangeButton
        selectedExchanges={selectedExchanges}
        onClick={() => setIsPopupOpen(true)}
      />
      <ExchangePopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        selectedExchanges={selectedExchanges}
        onExchangeToggle={onExchangeToggle}
        exchanges={EXCHANGE_OPTIONS}
      />
    </div>
  );
}