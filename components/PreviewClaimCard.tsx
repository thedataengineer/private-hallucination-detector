// PreviewClaimCard.tsx
import React from 'react';
interface Claim {
  claim: string;
  assessment: string;
  summary: string;
  original_text: string;
  fixed_original_text: string;
  confidence_score: number;
}

interface PreviewClaimCardProps {
  claim: Claim;
  onAcceptFix: (claim: Claim) => void;
}

export const PreviewClaimCard: React.FC<PreviewClaimCardProps> = ({ claim, onAcceptFix }) => {
  const isTrue = claim.assessment.toLowerCase().includes('true');
  const hasFix = claim.fixed_original_text !== claim.original_text;

  return (
    <div className="bg-white border rounded-none shadow-sm p-6 space-y-4 opacity-0 animate-fade-up [animation-delay:600ms]">
      <h3 className="font-semibold text-lg text-gray-900">{claim.claim}</h3>

      <div className="flex items-center gap-3">
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
        <span className="text-gray-600 text-sm">
          {claim.confidence_score}% Confident
        </span>
      </div>

      <p className="text-gray-700">{claim.summary}</p>

      <p className="text-sm text-gray-500 italic">
        Offline reasoning only — double-check important facts with trusted references.
      </p>

      {hasFix && (
        <div className="pt-5 space-y-2">
            <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Suggested Fix</span>
            </div>
                <div className="space-y-2 pb-2">
                    <p className="text-gray-500 line-through">{claim.original_text}</p>
                    <p className="text-green-700">{claim.fixed_original_text}</p>
                </div>
                <button
                    onClick={() => onAcceptFix(claim)}
                    className="w-full mt-4 px-4 py-2 bg-brand-default text-white font-semibold rounded-none hover:ring-1 transition-colors"
                    >
                    Accept Fix
                </button>
        </div>
        )}

    </div>
  );
};
