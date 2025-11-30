import React, { useState, useEffect } from 'react';
import { NavigationTab, Contract, User } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AIWorkbench from './components/AIWorkbench';
import ContractGenerator from './components/ContractGenerator';
import CameraScanner from './components/CameraScanner';
import GlobalContractsMap from './components/GlobalContractsMap';
import UserGuide from './components/UserGuide';
import Chatbot from './components/Chatbot';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProfilePage from './components/ProfilePage';
import TranslationModal from './components/shared/TranslationModal';
import Spinner from './components/shared/Spinner';
import * as authService from './services/authService';
import * as contractService from './services/contractService';
import { TranslateIcon } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.Dashboard);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isTranslationModalOpen, setIsTranslationModalOpen] = useState(false);
  const [isLoadingApp, setIsLoadingApp] = useState(true);

  const fetchContracts = async () => {
    try {
      const fetchedContracts = await contractService.getContracts();
      setContracts(fetchedContracts);
    } catch (error) {
      console.error("Failed to fetch contracts:", error);
      // Optionally show a toast notification to the user
    }
  };

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          await fetchContracts();
        }
      } catch (error) {
        console.log("No active session or session expired.");
      } finally {
        setIsLoadingApp(false);
      }
    };

    checkUserSession();
  }, []);

  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    await fetchContracts();
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setContracts([]);
    setActiveTab(NavigationTab.Dashboard); // Reset to default view
  };

  const handleRegister = (user: User) => {
    setCurrentUser(user);
    setContracts([]); // New users start with no contracts
  };
  
  const handleUpdateUser = (user: User) => {
    setCurrentUser(user);
  };

  const handleUpdateContract = async (updatedContract: Contract) => {
    try {
      const savedContract = await contractService.updateContract(updatedContract);
      setContracts(prevContracts =>
        prevContracts.map(c => (c.id === savedContract.id ? savedContract : c))
      );
    } catch (error) {
      console.error("Failed to update contract:", error);
    }
  };

  const handleAddNewContract = async (newContract: Omit<Contract, 'id' | 'location' | 'createdAt'> & { location: { name: string } }) => {
    try {
      const createdContract = await contractService.createContract(newContract);
      setContracts(prev => [createdContract, ...prev]);
    } catch (error) {
      console.error("Failed to add new contract:", error);
    }
  };

  const handleBulkUpdateContracts = async (contractIds: string[], status: Contract['status']) => {
    try {
      await contractService.bulkUpdateContracts(contractIds, status);
      setContracts(prev =>
        prev.map(c =>
          contractIds.includes(c.id) ? { ...c, status } : c
        )
      );
    } catch (error) {
      console.error("Failed to bulk update contracts:", error);
    }
  };

  const handleChatbotToggle = () => {
    setIsChatbotOpen(prev => !prev);
  };

  const handleTranslationModalToggle = () => {
    setIsTranslationModalOpen(prev => !prev);
  };

  const renderContent = () => {
    switch (activeTab) {
      case NavigationTab.Dashboard:
        return <Dashboard 
                  contracts={contracts} 
                  setActiveTab={setActiveTab} 
                  onUpdateContract={handleUpdateContract} 
                  onBulkUpdateContracts={handleBulkUpdateContracts}
                  onAddNewContract={handleAddNewContract} 
                />;
      case NavigationTab.AIWorkbench:
        return <AIWorkbench />;
      case NavigationTab.Generator:
        return <ContractGenerator />;
      case NavigationTab.Scanner:
        return <CameraScanner />;
      case NavigationTab.Map:
        return <GlobalContractsMap contracts={contracts} />;
      case NavigationTab.UserGuide:
        return <UserGuide />;
      case NavigationTab.Profile:
        return <ProfilePage currentUser={currentUser!} onUpdateUser={handleUpdateUser} />;
      default:
        return <Dashboard 
                  contracts={contracts} 
                  setActiveTab={setActiveTab} 
                  onUpdateContract={handleUpdateContract} 
                  onBulkUpdateContracts={handleBulkUpdateContracts} 
                  onAddNewContract={handleAddNewContract}
                />;
    }
  };
  
  if (isLoadingApp) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!currentUser) {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
            {authView === 'login' ? (
                <LoginPage onLogin={handleLogin} onNavigateToRegister={() => setAuthView('register')} />
            ) : (
                <RegisterPage onRegister={handleRegister} onNavigateToLogin={() => setAuthView('login')} />
            )}
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onChatbotToggle={handleChatbotToggle}
        onLogout={handleLogout}
        currentUser={currentUser}
      />
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
      {isChatbotOpen && <Chatbot onClose={handleChatbotToggle} contracts={contracts} />}
      <button
        onClick={handleTranslationModalToggle}
        className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 lg:bottom-8 lg:left-8 w-14 h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-full flex items-center justify-center shadow-lg z-40 transition-transform hover:scale-110"
        aria-label="Open translator"
      >
        <TranslateIcon />
      </button>

      {isTranslationModalOpen && <TranslationModal onClose={handleTranslationModalToggle} />}
    </div>
  );
};

export default App;