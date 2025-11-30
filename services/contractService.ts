import { Contract } from '../types';
import { mockContracts } from '../data/mockData';

const CONTRACTS_KEY = 'astralex_contracts';

const getStoredContracts = (): Contract[] => {
    const contractsJson = localStorage.getItem(CONTRACTS_KEY);
    if (contractsJson) {
        return JSON.parse(contractsJson);
    }
    localStorage.setItem(CONTRACTS_KEY, JSON.stringify(mockContracts));
    return mockContracts;
};

const saveStoredContracts = (contracts: Contract[]) => {
    localStorage.setItem(CONTRACTS_KEY, JSON.stringify(contracts));
};

export const getContracts = async (): Promise<Contract[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(getStoredContracts());
    }, 500);
  });
};

export const createContract = async (contractData: Omit<Contract, 'id' | 'location' | 'createdAt'> & { location: { name: string } }): Promise<Contract> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const contracts = getStoredContracts();
      const newContract: Contract = {
        ...contractData,
        id: `c_${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
        location: {
            name: contractData.location.name,
            coordinates: [0, 0] // Mock coordinates
        }
      };
      const updatedContracts = [newContract, ...contracts];
      saveStoredContracts(updatedContracts);
      resolve(newContract);
    }, 500);
  });
};

export const updateContract = async (contractData: Contract): Promise<Contract> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let contracts = getStoredContracts();
      const contractIndex = contracts.findIndex(c => c.id === contractData.id);
      
      if (contractIndex === -1) {
        return reject(new Error('Contract not found.'));
      }
      
      contracts[contractIndex] = contractData;
      saveStoredContracts(contracts);
      resolve(contractData);
    }, 500);
  });
};

export const bulkUpdateContracts = async (contractIds: string[], status: Contract['status']): Promise<{ success: boolean }> => {
  return new Promise(resolve => {
    setTimeout(() => {
      let contracts = getStoredContracts();
      const updatedContracts = contracts.map(c => 
        contractIds.includes(c.id) ? { ...c, status } : c
      );
      saveStoredContracts(updatedContracts);
      resolve({ success: true });
    }, 500);
  });
};
