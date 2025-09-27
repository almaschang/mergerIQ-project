import React from 'react';
import TradingViewCalendar from '../components/calendar/TradingViewCalendar';

export default function Calendar() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Economic Calendar</h1>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <TradingViewCalendar />
          </div>
        </div>
      </div>
    </div>
  );
}