import React, { useState, useEffect, useRef } from 'react';
import { Contract, NavigationTab } from '../types';
import Card from './shared/Card';
import RiskChip from './shared/RiskChip';
import ContractDetailModal from './shared/ContractDetailModal';
import { PlusIcon } from '../constants';
import ContractDistributionChart from './ContractDistributionChart';

interface DashboardProps {
  contracts: Contract[];
  setActiveTab: (tab: NavigationTab) => void;
  onUpdateContract: (contract: Contract) => void;
  onBulkUpdateContracts: (contractIds: string[], status: Contract['status']) => void;
  onAddNewContract: (contract: Omit<Contract, 'id' | 'location' | 'createdAt'> & { location: { name: string } }) => void;
}

interface EditContractModalProps {
  contract: Contract;
  onSave: (updatedContract: Contract) => void;
  onClose: () => void;
}

const EditContractModal: React.FC<EditContractModalProps> = ({ contract, onSave, onClose }) => {
  const [formData, setFormData] = useState(contract);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'parties') {
        setFormData(prev => ({ ...prev, [name]: value.split(',').map(p => p.trim()) }));
    } else if (name === 'locationName') {
        setFormData(prev => ({ ...prev, location: { ...prev.location, name: value } }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="edit-contract-title" className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in px-4" onClick={onClose}>
      <div className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <Card className="bg-gray-800 border-gray-600">
          <form onSubmit={handleSubmit}>
            <h2 id="edit-contract-title" className="text-2xl font-bold text-white mb-6">Edit Contract</h2>
            
            <div className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                    <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none" required />
                </div>
                <div>
                    <label htmlFor="parties" className="block text-sm font-medium text-gray-300 mb-1">Parties (comma-separated)</label>
                    <input type="text" name="parties" id="parties" value={formData.parties.join(', ')} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                        <select name="status" id="status" value={formData.status} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none">
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="deadline" className="block text-sm font-medium text-gray-300 mb-1">Deadline</label>
                        <input type="date" name="deadline" id="deadline" value={formData.deadline} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none" required />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="riskLevel" className="block text-sm font-medium text-gray-300 mb-1">Risk Level</label>
                        <select name="riskLevel" id="riskLevel" value={formData.riskLevel as string} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="locationName" className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                        <input type="text" name="locationName" id="locationName" value={formData.location.name} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none" required />
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition-colors">Cancel</button>
              <button type="submit" className="py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-md transition-colors">Save Changes</button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

const NewContractModal: React.FC<{
  onSave: (contract: Omit<Contract, 'id' | 'location' | 'createdAt'> & { location: { name: string } }) => void;
  onClose: () => void;
}> = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    parties: [],
    status: 'active' as Contract['status'],
    deadline: new Date().toISOString().split('T')[0],
    riskLevel: 'low' as Contract['riskLevel'],
    location: { name: '' },
  });

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'parties') {
        setFormData(prev => ({ ...prev, [name]: value.split(',').map(p => p.trim()) as [] }));
    } else if (name === 'locationName') {
        setFormData(prev => ({ ...prev, location: { name: value } }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="new-contract-title" className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in px-4" onClick={onClose}>
      <div className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <Card className="bg-gray-800 border-gray-600">
          <form onSubmit={handleSubmit}>
            <h2 id="new-contract-title" className="text-2xl font-bold text-white mb-6">Add New Contract</h2>
            
            <div className="space-y-4">
                <div>
                    <label htmlFor="new-title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                    <input type="text" name="title" id="new-title" value={formData.title} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none" required />
                </div>
                <div>
                    <label htmlFor="new-parties" className="block text-sm font-medium text-gray-300 mb-1">Parties (comma-separated)</label>
                    <input type="text" name="parties" id="new-parties" value={formData.parties.join(', ')} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="new-status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                        <select name="status" id="new-status" value={formData.status} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none">
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="new-deadline" className="block text-sm font-medium text-gray-300 mb-1">Deadline</label>
                        <input type="date" name="deadline" id="new-deadline" value={formData.deadline} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none" required />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="new-riskLevel" className="block text-sm font-medium text-gray-300 mb-1">Risk Level</label>
                        <select name="riskLevel" id="new-riskLevel" value={formData.riskLevel as string} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="new-locationName" className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                        <input type="text" name="locationName" id="new-locationName" value={formData.location.name} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none" required />
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition-colors">Cancel</button>
              <button type="submit" className="py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-md transition-colors">Save Contract</button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};


const Dashboard: React.FC<DashboardProps> = ({ contracts, setActiveTab, onUpdateContract, onBulkUpdateContracts, onAddNewContract }) => {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [isNewContractModalOpen, setIsNewContractModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContractIds, setSelectedContractIds] = useState<Set<string>>(new Set());
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(now.getDate() + 7);

  const getDaysRemainingText = (deadline: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to the start of the day
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `in ${diffDays} days`;
  };

  const urgentDeadlines = contracts
    .filter(c => {
        const deadlineDate = new Date(c.deadline);
        return c.status === 'active' && deadlineDate >= now && deadlineDate <= sevenDaysFromNow;
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const upcomingDeadlines = contracts
    .filter(c => c.status === 'active' && new Date(c.deadline) > sevenDaysFromNow)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  const filteredActiveContracts = contracts
    .filter(c => c.status === 'active')
    .filter(contract => {
        const query = searchQuery.toLowerCase();
        const titleMatch = contract.title.toLowerCase().includes(query);
        const partiesMatch = contract.parties.join(', ').toLowerCase().includes(query);
        return titleMatch || partiesMatch;
    });

  useEffect(() => {
    const numSelected = selectedContractIds.size;
    const numContracts = filteredActiveContracts.length;
    if (headerCheckboxRef.current) {
        headerCheckboxRef.current.checked = numSelected === numContracts && numContracts > 0;
        headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numContracts;
    }
  }, [selectedContractIds, filteredActiveContracts.length]);
    
  const handleSaveContract = (updatedContract: Contract) => {
    onUpdateContract(updatedContract);
    if (selectedContract && selectedContract.id === updatedContract.id) {
        setSelectedContract(updatedContract);
    }
  }

  const handleSelectOne = (contractId: string) => {
    setSelectedContractIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(contractId)) {
            newSet.delete(contractId);
        } else {
            newSet.add(contractId);
        }
        return newSet;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedContractIds(new Set(filteredActiveContracts.map(c => c.id)));
    } else {
        setSelectedContractIds(new Set());
    }
  };

  const handleArchiveSelected = () => {
    onBulkUpdateContracts(Array.from(selectedContractIds), 'archived');
    setSelectedContractIds(new Set());
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-6">Contract Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Active Contracts</h2>
            <div className="mb-4 flex flex-wrap gap-4 justify-between items-center">
                <div className="flex-grow min-w-[250px]">
                    <input
                      type="text"
                      placeholder="Search by title or parties..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full max-w-md p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none text-gray-100"
                      aria-label="Search active contracts"
                    />
                </div>
                <div className="flex items-center space-x-4 flex-shrink-0">
                    <button 
                        onClick={() => setIsNewContractModalOpen(true)}
                        className="py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-md transition-colors text-sm flex items-center gap-2"
                        aria-label="Add new contract"
                    >
                        <PlusIcon />
                        New Contract
                    </button>
                    {selectedContractIds.size > 0 && (
                        <>
                            <span className="text-sm text-gray-300">{selectedContractIds.size} selected</span>
                            <button 
                                onClick={handleArchiveSelected}
                                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors text-sm flex items-center gap-2"
                                aria-label="Mark selected contracts as archived"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8"/><path d="M10 12h4"/><path d="M22 4H2a2 2 0 0 0-2 2v2h24V6a2 2 0 0 0-2-2Z"/></svg>
                                Mark as Archived
                            </button>
                        </>
                    )}
                 </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400 text-sm">
                    <th className="py-2 px-4 w-12 text-center">
                        <input 
                            type="checkbox"
                            ref={headerCheckboxRef}
                            onChange={handleSelectAll}
                            className="bg-gray-700 border-gray-600 rounded"
                            aria-label="Select all contracts"
                        />
                    </th>
                    <th className="py-2 px-4">Title</th>
                    <th className="py-2 px-4">Parties</th>
                    <th className="py-2 px-4">Risk Level</th>
                    <th className="py-2 px-4">Deadline</th>
                    <th className="py-2 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActiveContracts.length > 0 ? (
                    filteredActiveContracts.map(contract => (
                      <tr 
                        key={contract.id} 
                        className={`border-b border-gray-800 hover:bg-gray-800/50 ${selectedContractIds.has(contract.id) ? 'bg-orange-900/20' : ''}`}
                      >
                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <input 
                                type="checkbox"
                                checked={selectedContractIds.has(contract.id)}
                                onChange={() => handleSelectOne(contract.id)}
                                className="bg-gray-700 border-gray-600 rounded"
                                aria-label={`Select contract ${contract.title}`}
                            />
                        </td>
                        <td className="py-3 px-4 font-medium cursor-pointer" onClick={() => setSelectedContract(contract)}>{contract.title}</td>
                        <td className="py-3 px-4 text-gray-300 cursor-pointer" onClick={() => setSelectedContract(contract)}>{contract.parties.join(', ')}</td>
                        <td className="py-3 px-4 cursor-pointer" onClick={() => setSelectedContract(contract)}><RiskChip level={contract.riskLevel} /></td>
                        <td className="py-3 px-4 text-gray-300 cursor-pointer" onClick={() => setSelectedContract(contract)}>{contract.deadline}</td>
                        <td className="py-3 px-4 text-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingContract(contract);
                            }}
                            className="text-orange-400 hover:text-orange-300 font-medium text-sm px-2 py-1 rounded"
                            aria-label={`Edit contract ${contract.title}`}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-400">
                        {searchQuery ? 'No contracts found matching your search.' : 'No active contracts.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        
        <div className="space-y-6">
           <Card className="border-orange-500/50">
            <h2 className="text-xl font-semibold mb-4 text-orange-400">Urgent: Deadline Next 7 Days</h2>
            {urgentDeadlines.length > 0 ? (
                <ul className="space-y-3">
                {urgentDeadlines.map(c => (
                    <li key={c.id} className="flex justify-between items-center text-sm">
                    <span className="font-medium truncate pr-4">{c.title}</span>
                    <span className="text-red-400 font-semibold flex-shrink-0">{getDaysRemainingText(c.deadline)}</span>
                    </li>
                ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-400">No contracts due in the next 7 days.</p>
            )}
          </Card>
          <Card>
            <h2 className="text-xl font-semibold mb-4">Upcoming Deadlines</h2>
            {upcomingDeadlines.length > 0 ? (
                <ul className="space-y-3">
                {upcomingDeadlines.map(c => (
                    <li key={c.id} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{c.title}</span>
                    <span className="text-orange-400">{c.deadline}</span>
                    </li>
                ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-400">No other upcoming deadlines.</p>
            )}
          </Card>
          <Card>
            <h2 className="text-xl font-semibold mb-4">Contract Distribution</h2>
            <ContractDistributionChart contracts={contracts} />
          </Card>
          <Card>
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="flex flex-col space-y-3">
              <button onClick={() => setActiveTab(NavigationTab.AIWorkbench)} className="w-full text-left p-3 bg-gray-700 hover:bg-orange-600 rounded-lg transition-colors">Analyze Document</button>
              <button onClick={() => setActiveTab(NavigationTab.Generator)} className="w-full text-left p-3 bg-gray-700 hover:bg-orange-600 rounded-lg transition-colors">Generate Contract</button>
              <button onClick={() => setActiveTab(NavigationTab.Scanner)} className="w-full text-left p-3 bg-gray-700 hover:bg-orange-600 rounded-lg transition-colors">Scan with Camera</button>
            </div>
          </Card>
        </div>
      </div>
      {selectedContract && <ContractDetailModal contract={selectedContract} onClose={() => setSelectedContract(null)} />}
      {editingContract && <EditContractModal contract={editingContract} onSave={handleSaveContract} onClose={() => setEditingContract(null)} />}
      {isNewContractModalOpen && <NewContractModal onSave={onAddNewContract} onClose={() => setIsNewContractModalOpen(false)} />}
    </div>
  );
};

export default Dashboard;