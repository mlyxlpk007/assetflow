import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/ui/use-toast';
import { Layers, Plus, Calendar, Tag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { productsApi } from '@/lib/api';

const ProductVersions = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getVersions();
      setVersions(data || []);
    } catch (error) {
      console.error('加载版本失败:', error);
      toast({ title: t('common.error'), description: t('productManagement.loadFailed'), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/products')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <Layers className="w-8 h-8 mr-3 text-indigo-400" />
                {t('productManagement.versionManagement')}
              </h1>
              <p className="text-gray-400">{t('productManagement.versionManagementDesc')}</p>
            </div>
          </div>
          <Button onClick={() => toast({ title: t('common.info'), description: t('common.featureNotImplemented') })}>
            <Plus className="w-4 h-4 mr-2" />
            {t('productManagement.createVersion')}
          </Button>
        </div>

        {/* 版本列表 */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <p>{t('common.loading')}</p>
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Layers className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p>{t('productManagement.noVersions')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {versions.map((version) => (
              <motion.div
                key={version.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Tag className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h3 className="font-semibold text-white">{version.version}</h3>
                      <p className="text-sm text-gray-400">{version.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{version.releaseDate || '-'}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      version.status === 'stable' ? 'bg-green-500/20 text-green-400' :
                      version.status === 'beta' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {version.status || '-'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductVersions;
