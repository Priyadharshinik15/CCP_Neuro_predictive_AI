import React from 'react';
import { NavigationTab, User } from '../types';
import { NAV_ITEMS, ICONS, MessageSquareIcon } from '../constants';

interface HeaderProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onChatbotToggle: () => void;
  currentUser: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onChatbotToggle, currentUser, onLogout }) => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-2xl font-bold tracking-tighter text-white">
              <span className="text-orange-500">Astra</span>Lex
            </div>
          </div>
          {currentUser && (
            <div className="flex items-center">
              <nav className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item}
                      onClick={() => setActiveTab(item)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        activeTab === item
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {ICONS[item as NavigationTab]}
                      {item}
                    </button>
                  ))}
                </div>
              </nav>
              <div className="hidden md:block ml-4 border-l border-gray-700 pl-4">
                  <div className="flex items-center gap-4">
                    <button
                        onClick={onChatbotToggle}
                        className="p-2 rounded-full text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        aria-label="Toggle AI assistant"
                    >
                        <MessageSquareIcon />
                    </button>
                    <button
                        onClick={onLogout}
                        className="py-2 px-4 bg-gray-700 hover:bg-red-600 text-white font-semibold rounded-md transition-colors text-sm"
                    >
                        Logout
                    </button>
                  </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
