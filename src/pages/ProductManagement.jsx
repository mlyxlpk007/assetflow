import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { List, Package, BarChart3, FileText, ShoppingBag, Layers, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProductManagement = () => {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <ShoppingBag className="w-8 h-8 mr-3 text-indigo-400" />
            {t('productManagement.title')}
          </h1>
          <p className="text-gray-400">{t('productManagement.description')}</p>
        </div>

        {/* 子页面导航 */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={() => navigate('/products/structure')}
            className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 h-auto p-4 flex flex-col items-start"
          >
            <Target className="w-6 h-6 mb-2 text-indigo-400" />
            <span className="font-semibold text-white">{t('productManagement.productStructure')}</span>
            <span className="text-xs text-gray-400 mt-1">{t('productManagement.productStructureDesc')}</span>
          </Button>
          
          <Button
            onClick={() => navigate('/products/catalog')}
            className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 h-auto p-4 flex flex-col items-start"
          >
            <List className="w-6 h-6 mb-2 text-indigo-400" />
            <span className="font-semibold text-white">{t('productManagement.productCatalog')}</span>
            <span className="text-xs text-gray-400 mt-1">{t('productManagement.productCatalogDesc')}</span>
          </Button>
          
          <Button
            onClick={() => navigate('/products/versions')}
            className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 h-auto p-4 flex flex-col items-start"
          >
            <Layers className="w-6 h-6 mb-2 text-indigo-400" />
            <span className="font-semibold text-white">{t('productManagement.versionManagement')}</span>
            <span className="text-xs text-gray-400 mt-1">{t('productManagement.versionManagementDesc')}</span>
          </Button>
          
          <Button
            onClick={() => navigate('/products/analytics')}
            className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 h-auto p-4 flex flex-col items-start"
          >
            <BarChart3 className="w-6 h-6 mb-2 text-indigo-400" />
            <span className="font-semibold text-white">{t('productManagement.productAnalytics')}</span>
            <span className="text-xs text-gray-400 mt-1">{t('productManagement.productAnalyticsDesc')}</span>
          </Button>
        </div>

        {/* 快速统计 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{t('productManagement.totalProducts')}</p>
                <p className="text-2xl font-bold text-white mt-1">0</p>
              </div>
              <Package className="w-8 h-8 text-indigo-400" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{t('productManagement.activeVersions')}</p>
                <p className="text-2xl font-bold text-white mt-1">0</p>
              </div>
              <Layers className="w-8 h-8 text-green-400" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{t('productManagement.relatedProjects')}</p>
                <p className="text-2xl font-bold text-white mt-1">0</p>
              </div>
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
          </motion.div>
        </div>

        {/* 最近更新 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 rounded-lg p-6 border border-gray-700"
        >
          <h2 className="text-xl font-semibold text-white mb-4">{t('productManagement.recentUpdates')}</h2>
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>{t('productManagement.noProducts')}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductManagement;
