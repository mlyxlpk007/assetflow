import React, { createContext, useContext, useState, useEffect } from 'react';

const I18nContext = createContext();

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // 从localStorage读取保存的语言设置，默认为中文
    return localStorage.getItem('app_language') || 'zh-CN';
  });
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    // 动态加载语言文件
    const loadTranslations = async () => {
      try {
        if (language === 'zh-CN') {
          const zhCN = await import('./locales/zh-CN.js');
          setTranslations(zhCN.default);
        } else if (language === 'en-US') {
          const enUS = await import('./locales/en-US.js');
          setTranslations(enUS.default);
        }
      } catch (error) {
        console.error('Failed to load translations:', error);
        // 如果加载失败，尝试加载中文作为后备
        try {
          const zhCN = await import('./locales/zh-CN.js');
          setTranslations(zhCN.default);
        } catch (fallbackError) {
          console.error('Failed to load fallback translations:', fallbackError);
        }
      }
    };

    loadTranslations();
  }, [language]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key, params = {}) => {
    // 支持嵌套键，如 'nav.dashboard'
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // 如果找不到翻译，返回键本身
        console.warn(`Translation missing for key: ${key}`);
        return key;
      }
    }

    // 如果值是字符串，进行参数替换
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, key) => {
        return params[key] !== undefined ? params[key] : match;
      });
    }

    return value || key;
  };

  return (
    <I18nContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};
