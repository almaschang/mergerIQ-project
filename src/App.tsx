import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import CompanyDetail from './components/company/CompanyDetail';
import MarketData from './pages/MarketData';
import StockScreener from './pages/StockScreener';
import Calendar from './pages/Calendar';
import Heatmaps from './pages/Heatmaps';

type Page = 'dashboard' | 'market-data' | 'screener' | 'calendar' | 'heatmaps';

export default function App() {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const handleBack = () => {
    setSelectedSymbol(null);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-[#1a1b26] text-gray-900 dark:text-white transition-colors">
        <Navbar 
          onCompanySelect={setSelectedSymbol}
          onNavigate={setCurrentPage}
          currentPage={currentPage}
        />
        
        {selectedSymbol ? (
          <CompanyDetail symbol={selectedSymbol} onBack={handleBack} />
        ) : (
          <>
            {currentPage === 'dashboard' && <Dashboard />}
            {currentPage === 'market-data' && <MarketData />}
            {currentPage === 'screener' && <StockScreener />}
            {currentPage === 'calendar' && <Calendar />}
            {currentPage === 'heatmaps' && <Heatmaps />}
          </>
        )}
      </div>
    </ThemeProvider>
  );
}