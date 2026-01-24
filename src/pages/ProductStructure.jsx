import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  ChevronRight, ChevronDown, Package, Layers, Zap, Wrench, 
  Users, MapPin, Briefcase, Link2, Archive, User, FileText,
  Building2, Globe, Target, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { productsApi } from '@/lib/api';

const ProductStructure = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // 模块类型配置
  const moduleTypes = {
    structure: { name: '结构', icon: Package, color: 'text-blue-400' },
    electronic: { name: '电子', icon: Zap, color: 'text-yellow-400' },
    software: { name: '软件', icon: Layers, color: 'text-green-400' },
    other: { name: '其他', icon: Wrench, color: 'text-gray-400' }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getStructure();
      setProducts(data || []);
    } catch (error) {
      console.error('加载产品失败:', error);
      toast({ title: t('common.error'), description: t('productManagement.loadFailed'), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const isExpanded = (itemId) => expandedItems.has(itemId);

  const renderFunction = (functionItem, level = 0) => {
    const indent = level * 24;
    return (
      <motion.div
        key={functionItem.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="border-l-2 border-gray-700 ml-4 pl-4 py-2"
        style={{ marginLeft: `${indent}px` }}
      >
        <div className="bg-gray-800/30 rounded-lg p-3 mb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="font-medium text-white">{functionItem.name}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
            {/* 关联资产 */}
            {functionItem.assets && functionItem.assets.length > 0 && (
              <div className="bg-gray-700/30 rounded p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Archive className="w-3 h-3 text-indigo-400" />
                  <span className="text-xs text-gray-400">{t('productManagement.relatedAssets')}</span>
                </div>
                {functionItem.assets.map((asset, idx) => (
                  <div key={idx} className="text-xs text-white">
                    {asset.assetId} {asset.assetVersion && <span className="text-gray-500">({asset.assetVersion})</span>}
                  </div>
                ))}
              </div>
            )}

            {/* 负责工程师 */}
            {functionItem.engineers && functionItem.engineers.length > 0 && (
              <div className="bg-gray-700/30 rounded p-2">
                <div className="flex items-center gap-1 mb-1">
                  <User className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-gray-400">{t('productManagement.responsibleEngineers')}</span>
                </div>
                {functionItem.engineers.map((eng, idx) => (
                  <div key={idx} className="text-xs text-white">{eng.engineerId}</div>
                ))}
              </div>
            )}

            {/* 客户群 */}
            {functionItem.customers && functionItem.customers.length > 0 && (
              <div className="bg-gray-700/30 rounded p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Building2 className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-gray-400">{t('productManagement.customerGroups')}</span>
                </div>
                {functionItem.customers.map((customer, idx) => (
                  <div key={idx} className="text-xs text-white">
                    {customer.customerName} {customer.region && <span className="text-gray-500">({customer.region})</span>}
                  </div>
                ))}
              </div>
            )}

            {/* 关联任务 */}
            {functionItem.tasks && functionItem.tasks.length > 0 && (
              <div className="bg-gray-700/30 rounded p-2">
                <div className="flex items-center gap-1 mb-1">
                  <FileText className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-gray-400">{t('productManagement.relatedTasks')}</span>
                </div>
                {functionItem.tasks.map((task, idx) => (
                  <div key={idx} className="text-xs text-white">{task.taskId}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderSubModule = (subModule, level = 0) => {
    const indent = level * 24;
    const subModuleId = `submodule-${subModule.id}`;
    const isSubExpanded = isExpanded(subModuleId);

    return (
      <div key={subModule.id} className="mb-2" style={{ marginLeft: `${indent}px` }}>
        <div
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-800/50 cursor-pointer"
          onClick={() => toggleExpand(subModuleId)}
        >
          {isSubExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="font-medium text-gray-300">{subModule.name}</span>
          <span className="text-xs text-gray-500 ml-2">
            ({subModule.functions?.length || 0} {t('productManagement.functions')})
          </span>
        </div>
        
        <AnimatePresence>
          {isSubExpanded && subModule.functions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="ml-6"
            >
              {subModule.functions.map(func => renderFunction(func, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderModule = (module, level = 0) => {
    const indent = level * 24;
    const moduleId = `module-${module.id}`;
    const isModExpanded = isExpanded(moduleId);
    const moduleConfig = moduleTypes[module.type] || moduleTypes.other;
    const ModuleIcon = moduleConfig.icon;

    return (
      <div key={module.id} className="mb-3" style={{ marginLeft: `${indent}px` }}>
        <div
          className="flex items-center gap-2 p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-gray-600 cursor-pointer"
          onClick={() => toggleExpand(moduleId)}
        >
          {isModExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
          <ModuleIcon className={`w-5 h-5 ${moduleConfig.color}`} />
          <span className="font-semibold text-white">{module.name}</span>
          <span className="text-xs text-gray-500 ml-2">
            ({module.subModules?.length || 0} {t('productManagement.subModules')})
          </span>
        </div>
        
        <AnimatePresence>
          {isModExpanded && module.subModules && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="ml-6 mt-2"
            >
              {module.subModules.map(subMod => renderSubModule(subMod, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderProduct = (product) => {
    const productId = `product-${product.id}`;
    const isProdExpanded = isExpanded(productId);

    return (
      <motion.div
        key={product.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700"
      >
        <div
          className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 cursor-pointer hover:bg-gray-900/70"
          onClick={() => toggleExpand(productId)}
        >
          <div className="flex items-center gap-3">
            {isProdExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
            <Package className="w-6 h-6 text-indigo-400" />
            <div>
              <h3 className="text-lg font-bold text-white">{product.name}</h3>
              <p className="text-sm text-gray-400">{product.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>{product.modules?.length || 0} {t('productManagement.modules')}</span>
          </div>
        </div>

        <AnimatePresence>
          {isProdExpanded && product.modules && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              {product.modules.map(mod => renderModule(mod, 0))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
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
                <Target className="w-8 h-8 mr-3 text-indigo-400" />
                {t('productManagement.productStructure')}
              </h1>
              <p className="text-gray-400">{t('productManagement.productStructureDesc')}</p>
            </div>
          </div>
        </div>

        {/* 视图说明 */}
        <div className="mb-6 bg-indigo-900/20 border border-indigo-700/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-indigo-400 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-medium mb-1">{t('productManagement.structureHierarchy')}</p>
              <p className="text-gray-400">
                {t('productManagement.structureHierarchyDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* 产品列表 */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <p>{t('common.loading')}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p>{t('productManagement.noProducts')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map(product => renderProduct(product))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductStructure;
