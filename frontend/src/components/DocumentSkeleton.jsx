import React from 'react';

const DocumentCardSkeleton = () => {
  return (
    <li className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 flex flex-col justify-between list-none animate-pulse">
      <div>
        {/* Top section with status and icon placeholders */}
        <div className="flex justify-between items-start mb-3">
          <div className="h-5 w-16 bg-slate-600 rounded-full"></div>
          <div className="h-5 w-5 bg-slate-600 rounded"></div>
        </div>
        {/* Title placeholder */}
        <div className="h-6 w-3/4 bg-slate-600 rounded mt-4"></div>
      </div>
      {/* Button placeholder */}
      <div className="mt-4">
        <div className="h-9 w-full bg-slate-600 rounded"></div>
      </div>
    </li>
  );
};

export default DocumentCardSkeleton;