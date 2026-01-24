import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/ui/use-toast';
import { BarChart3, TrendingUp, Users, Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { productsApi } from '@/lib/api';

const ProductAnalytics = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('加载分析数据失败:', error);
      toast({ title: t('common.error'), description: t('productManagement.loadFailed'), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <BarChart3 className="w-8 h-8 mr-3 text-indigo-400" />
              {t('productManagement.productAnalytics')}
            </h1>
            <p className="text-gray-400">{t('productManagement.productAnalyticsDesc')}</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{t('productManagement.totalProducts')}</p>
                <p className="text-2xl font-bold text-white mt-1">{analytics?.totalProducts || 0}</p>
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
                <p className="text-2xl font-bold text-white mt-1">{analytics?.activeVersions || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
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
                <p className="text-2xl font-bold text-white mt-1">{analytics?.relatedProjects || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{t('productManagement.totalReleases')}</p>
                <p className="text-2xl font-bold text-white mt-1">{analytics?.totalReleases || 0}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-400" />
            </div>
          </motion.div>
        </div>

        {/* 图表区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 rounded-lg p-6 border border-gray-700"
        >
          <h2 className="text-xl font-semibold text-white mb-4">{t('productManagement.analyticsCharts')}</h2>
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p>{t('productManagement.noAnalyticsData')}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductAnalytics;
