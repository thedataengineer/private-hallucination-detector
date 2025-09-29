import React from 'react';
interface ClaimsListResult {
  claim: string;
  assessment: string;
  summary: string;
  fixed_original_text: string;
  confidence_score: number;
}

interface ClaimsListResultsProps {
  results: ClaimsListResult[];
}

const ClaimsListResults: React.FC<ClaimsListResultsProps> = ({ results }) => {
  const getStatusBadge = (assessment: string) => {
    const isTrue = assessment.toLowerCase().includes('true');
    return (
      <span 
        className={`inline-flex items-center px-3 py-1 rounded-none text-sm font-medium ${
          isTrue 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}
      >
        <span className="mr-2">{isTrue ? '✅' : '❌'}</span>
        {isTrue ? 'Supported' : 'Refuted'}
      </span>
    );
  };

  return (
    <div className="mt-6 w-full bg-white p-6 border rounded-none shadow-sm space-y-16">
      {results
      .filter((result) => result.assessment.toLowerCase() !== 'insufficient information')
      .map((result, index) => (
        <div key={index} className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-900">{result.claim}</h3>
          
          <div className="flex items-center space-x-3">
            {getStatusBadge(result.assessment)}
            <span className="text-gray-600 text-sm">
              {result.confidence_score}% Confident
            </span>
          </div>
          
          <p className="text-gray-700 mt-2">{result.summary}</p>

          {/* <p className="text-gray-700 mt-2">{result.fixed_original_text}</p> */}
          
          <div className="mt-4 text-sm text-gray-500 italic">
            Offline mode: external citations are unavailable, so treat this verdict as advisory.
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClaimsListResults;
