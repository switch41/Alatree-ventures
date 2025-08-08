import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Globe, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ onMenuClick }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 focus-ring"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative group">
              <button className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 focus-ring rounded-md">
                <Globe className="w-4 h-4" />
                <span className="hidden sm:block">{i18n.language.toUpperCase()}</span>
              </button>
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button
                  onClick={() => changeLanguage('en')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus-ring"
                >
                  English
                </button>
                <button
                  onClick={() => changeLanguage('es')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus-ring"
                >
                  Español
                </button>
                <button
                  onClick={() => changeLanguage('fr')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus-ring"
                >
                  Français
                </button>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 focus-ring rounded-md"
                title={t('auth.logout')}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">{t('auth.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;