import React from 'react';
import { Languages } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const SettingsModal = ({ isOpen, onClose }) => {
  const { t, language, changeLanguage } = useI18n();

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Languages className="w-5 h-5" />
            {t('nav.settings')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* 语言设置 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-gray-400" />
              <label className="text-sm font-medium text-gray-300">
                {language === 'zh-CN' ? '语言设置' : 'Language Settings'}
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => changeLanguage('zh-CN')}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  language === 'zh-CN'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                中文
              </button>
              <button
                onClick={() => changeLanguage('en-US')}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  language === 'en-US'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                English
              </button>
            </div>
            <p className="text-xs text-gray-500">
              {language === 'zh-CN' 
                ? '当前语言：中文' 
                : 'Current Language: English'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
