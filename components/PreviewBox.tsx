// PreviewBox.tsx
import React, { useState, useEffect } from 'react';
import { PreviewClaimCard } from './PreviewClaimCard';
import { Copy, CheckCheck } from 'lucide-react';

interface Claim {
  claim: string;
  assessment: string;
  summary: string;
  original_text: string;
  fixed_original_text: string;
  confidence_score: number;
}

interface PreviewBoxProps {
  content: string;
  claims: Claim[];
}

const PreviewBox: React.FC<PreviewBoxProps> = ({ content, claims }) => {
  const [displayText, setDisplayText] = useState(content);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [copied, setCopied] = useState(false);

  // Filter out claims with "Insufficient Information"
  const filteredClaims = claims.filter(
    (claim) => claim.assessment.toLowerCase() !== 'insufficient information'
  );

  const claimsNeedingFix = filteredClaims.filter(
    (claim) => claim.assessment.toLowerCase() === 'false'
  );

  useEffect(() => {
    if (claimsNeedingFix.length > 0 && !selectedClaim) {
      setSelectedClaim(claimsNeedingFix[0]);
    }
  }, [claimsNeedingFix]);

  const highlightClaims = () => {
    let segments = [];
    let lastIndex = 0;

    const sortedClaims = [...filteredClaims].sort((a, b) => {
      return displayText.indexOf(a.original_text) - displayText.indexOf(b.original_text);
    });

    sortedClaims.forEach((claim) => {
      const index = displayText.indexOf(claim.original_text, lastIndex);
      if (index !== -1) {
        const previousText = displayText.substring(lastIndex, index);
        segments.push(
          previousText.split('\n').map((line, i) => (
            <React.Fragment key={`text-${lastIndex}-${i}`}>
              {i > 0 && <br />}
              {line}
            </React.Fragment>
          ))
        );

        const isTrue = claim.assessment.toLowerCase().includes('true');
        segments.push(
          <span
            key={`claim-${index}`}
            className={`cursor-pointer border-b-2 ${
              isTrue ? 'border-green-500 hover:bg-green-100' : 'border-red-500 hover:bg-red-100'
            } ${selectedClaim === claim ? isTrue ? 'bg-green-100' : 'bg-red-100' : ''}`}
            onClick={() => setSelectedClaim(claim)}
          >
            {claim.original_text}
          </span>
        );
        lastIndex = index + claim.original_text.length;
      }
    });

    const remainingText = displayText.substring(lastIndex);
    segments.push(
      remainingText.split('\n').map((line, i) => (
        <React.Fragment key={`text-end-${i}`}>
          {i > 0 && <br />}
          {line}
        </React.Fragment>
      ))
    );

    return segments;
  };

  const acceptFix = (claim: Claim) => {
    setDisplayText(displayText.replace(claim.original_text, claim.fixed_original_text));
    
    const currentIndex = claimsNeedingFix.indexOf(claim);
    const nextClaim = claimsNeedingFix[currentIndex + 1];
    setSelectedClaim(nextClaim || null);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 w-full">

      {/* Preview Box */}
      <div className="relative">
        <div className="w-full min-h-[200px] p-6 bg-white border rounded-none shadow-sm opacity-0 animate-fade-up [animation-delay:200ms]">
          {highlightClaims()}
        </div>
        
        {/* Copy Button */}
        <div className="flex justify-end mt-3 mb-10 mr-5 opacity-0 animate-fade-up [animation-delay:400ms]">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {copied ? (
              <>
                <CheckCheck size={16} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy all text</span>
              </>
            )}
          </button>
        </div>
      </div>

      {selectedClaim && (
        <PreviewClaimCard
          claim={selectedClaim}
          onAcceptFix={acceptFix}
        />
      )}
    </div>
  );
};

export default PreviewBox;
