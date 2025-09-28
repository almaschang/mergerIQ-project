import React from 'react';

export default function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="w-full px-4 sm:px-6 lg:px-10 mx-auto">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
