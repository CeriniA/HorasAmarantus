/**
 * Tarjeta de Métrica con Comparación
 * Muestra una métrica con comparación vs período anterior
 */

import Card from '../common/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const MetricCardWithComparison = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue',
  comparison,
  subtitle,
  loading = false
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-600'
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      iconBg: 'bg-orange-100',
      iconText: 'text-orange-600'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  const getTrendIcon = () => {
    if (!comparison) return null;
    
    if (comparison.change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (comparison.change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    if (!comparison) return '';
    
    if (comparison.change > 0) {
      return 'text-green-600';
    } else if (comparison.change < 0) {
      return 'text-red-600';
    } else {
      return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gray-200 p-3 rounded-lg w-12 h-12" />
            <div className="ml-4 flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1">
          <div className={`flex-shrink-0 ${colors.iconBg} p-3 rounded-lg`}>
            <Icon className={`h-6 w-6 ${colors.iconText}`} />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-500">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
            
            {/* Comparación con período anterior */}
            {comparison && (
              <div className="flex items-center mt-2">
                {getTrendIcon()}
                <span className={`text-sm font-medium ml-1 ${getTrendColor()}`}>
                  {comparison.percentChange > 0 ? '+' : ''}
                  {comparison.percentChange}%
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  vs {comparison.periodLabel || 'período anterior'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MetricCardWithComparison;
