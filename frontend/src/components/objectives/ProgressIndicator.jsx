/**
 * Componente: ProgressIndicator
 * Muestra el indicador visual de progreso (ON_TRACK, BEHIND, AHEAD)
 */

import PropTypes from 'prop-types';
import { TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { OBJECTIVE_PROGRESS_STATUS, PROGRESS_STATUS_LABELS, PROGRESS_STATUS_COLORS } from '../../constants';

export const ProgressIndicator = ({ progressStatus, compact = false }) => {
  if (!progressStatus) return null;

  const config = {
    [OBJECTIVE_PROGRESS_STATUS.ON_TRACK]: {
      icon: CheckCircle,
      color: 'text-green-700',
      iconColor: 'text-green-600'
    },
    [OBJECTIVE_PROGRESS_STATUS.BEHIND]: {
      icon: TrendingDown,
      color: 'text-orange-700',
      iconColor: 'text-orange-600'
    },
    [OBJECTIVE_PROGRESS_STATUS.AHEAD]: {
      icon: TrendingUp,
      color: 'text-blue-700',
      iconColor: 'text-blue-600'
    }
  };

  const { icon: Icon, color, iconColor } = config[progressStatus] || config[OBJECTIVE_PROGRESS_STATUS.ON_TRACK];
  const bgClasses = PROGRESS_STATUS_COLORS[progressStatus] || PROGRESS_STATUS_COLORS[OBJECTIVE_PROGRESS_STATUS.ON_TRACK];

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded border ${bgClasses}`}>
        <Icon className={`h-3 w-3 ${iconColor}`} />
        <span className={`text-xs font-medium ${color}`}>
          {PROGRESS_STATUS_LABELS[progressStatus]}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg border ${bgClasses}`}>
      <Icon className={`h-5 w-5 ${iconColor}`} />
      <span className={`text-sm font-medium ${color}`}>
        {PROGRESS_STATUS_LABELS[progressStatus]}
      </span>
    </div>
  );
};

ProgressIndicator.propTypes = {
  progressStatus: PropTypes.oneOf(Object.values(OBJECTIVE_PROGRESS_STATUS)),
  compact: PropTypes.bool
};

export default ProgressIndicator;
