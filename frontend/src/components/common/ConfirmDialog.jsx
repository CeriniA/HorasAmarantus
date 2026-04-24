/**
 * ConfirmDialog - Diálogo de confirmación reutilizable
 * Reemplaza window.confirm() con una UI consistente
 */

import { AlertTriangle, Info, HelpCircle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning', // 'warning', 'danger', 'info'
  loading = false
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertTriangle className="h-12 w-12 text-red-600" />;
      case 'info':
        return <Info className="h-12 w-12 text-blue-600" />;
      default:
        return <HelpCircle className="h-12 w-12 text-yellow-600" />;
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-yellow-600 hover:bg-yellow-700';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <div className="text-center py-4">
        <div className="mx-auto mb-4">
          {getIcon()}
        </div>
        <p className="text-gray-700 mb-6">{message}</p>
        
        <div className="flex justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={getButtonVariant()}
          >
            {loading ? 'Procesando...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
