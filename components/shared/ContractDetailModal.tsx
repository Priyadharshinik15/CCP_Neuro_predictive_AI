import React, { useEffect } from 'react';
import { Contract } from '../../types';
import Card from './Card';
import { CheckCircleIcon, AlertTriangleIcon, AlertOctagonIcon } from '../../constants';

interface ContractDetailModalProps {
  contract: Contract;
  onClose: () => void;
}

const riskInfo = {
    low: {
      icon: <CheckCircleIcon />,
      className: 'text-green-400',
      bgClassName: 'bg-green-900/40',
    },
    medium: {
      icon: <AlertTriangleIcon />,
      className: 'text-yellow-400',
      bgClassName: 'bg-yellow-900/40',
    },
    high: {
      icon: <AlertOctagonIcon />,
      className: 'text-red-400',
      bgClassName: 'bg-red-900/40',
    },
};


const ContractDetailModal: React.FC<ContractDetailModalProps> = ({ contract, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const currentRisk = riskInfo[contract.riskLevel];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contract-details-title"
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <Card className="bg-gray-800 border-gray-600">
          <div className="flex justify-between items-start">
            <h2 id="contract-details-title" className="text-2xl font-bold text-white mb-4 pr-4">{contract.title}</h2>
            <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
          </div>

          <div className="space-y-4 text-gray-300 mt-2">
            <div>
              <p className="text-sm text-gray-400 font-semibold tracking-wider uppercase">Parties</p>
              <p className="font-medium text-white mt-1">{contract.parties.join(', ')}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-400 font-semibold tracking-wider uppercase">Created At</p>
                    <p className="font-medium text-white mt-1">{contract.createdAt}</p>
                </div>
                 <div>
                    <p className="text-sm text-gray-400 font-semibold tracking-wider uppercase">Deadline</p>
                    <p className="font-medium text-white mt-1">{contract.deadline}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-400 font-semibold tracking-wider uppercase">Status</p>
                    <p className="font-medium text-white mt-1 capitalize">{contract.status}</p>
                </div>
                 <div>
                    <p className="text-sm text-gray-400 font-semibold tracking-wider uppercase">Location</p>
                    <p className="font-medium text-white mt-1">{contract.location.name}</p>
                </div>
            </div>
             <div>
              <p className="text-sm text-gray-400 font-semibold tracking-wider uppercase">Risk Level</p>
              <div className={`mt-2 flex items-center gap-3 p-3 rounded-lg ${currentRisk.bgClassName} ${currentRisk.className}`}>
                {currentRisk.icon}
                <span className="font-bold text-lg capitalize">{contract.riskLevel} Risk</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ContractDetailModal;