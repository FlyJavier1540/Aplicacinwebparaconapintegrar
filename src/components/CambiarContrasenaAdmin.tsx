import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Lock, Eye, EyeOff, CheckCircle2, User, Shield } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { passwordFormStyles } from '../styles/shared-styles';
import { authService } from '../utils/authService';

interface CambiarContrasenaAdminProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any; // El usuario que está haciendo el cambio (admin o coordinador)
  targetUser: any; // El usuario cuya contraseña se va a cambiar
}

export function CambiarContrasenaAdmin({ isOpen, onClose, currentUser, targetUser }: CambiarContrasenaAdminProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  // Verificar permisos
  const canChangePassword = () => {
    if (!currentUser || !targetUser) return false;
    
    // NUNCA se puede cambiar la contraseña de un Administrador (solo ellos mismos)
    if (targetUser.rol === 'Administrador') return false;
    
    // Administradores pueden cambiar contraseñas de Coordinadores y Guardarecursos
    if (currentUser.rol === 'Administrador') return true;
    
    // Coordinadores solo pueden cambiar contraseñas de guardarecursos
    if (currentUser.rol === 'Coordinador' && targetUser.rol === 'Guardarecurso') return true;
    
    return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Cambiar contraseña usando el servicio
    const result = authService.changeUserPasswordByAdmin(
      currentUser.id,
      targetUser.id,
      newPassword,
      confirmPassword
    );

    if (!result.success) {
      setError(result.error || 'Error al cambiar la contraseña');
      return;
    }

    toast.success('Contraseña actualizada', {
      description: `Se ha actualizado la contraseña de ${targetUser.nombre} ${targetUser.apellido} exitosamente.`
    });

    // Limpiar formulario y cerrar
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  if (!targetUser) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={passwordFormStyles.dialogContent}>
        <DialogHeader className={passwordFormStyles.dialogHeader}>
          <DialogTitle className={passwordFormStyles.dialogTitle}>Cambiar Contraseña</DialogTitle>
          <DialogDescription className={passwordFormStyles.dialogDescription}>
            Actualizar contraseña de usuario
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className={passwordFormStyles.form}>
          {/* Información del usuario objetivo - Minimalista */}
          <div className="flex items-center gap-2.5 mb-4">
            <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {targetUser.nombre} {targetUser.apellido}
            </span>
          </div>

          {error && (
            <Alert variant="destructive" className="text-xs py-2">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <div className={passwordFormStyles.field}>
            <Label htmlFor="newPassword" className={passwordFormStyles.label}>
              Nueva Contraseña *
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ingrese la nueva contraseña"
                className={passwordFormStyles.inputPassword}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className={passwordFormStyles.passwordToggle}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className={passwordFormStyles.hint}>
              Mínimo 6 caracteres
            </p>
          </div>

          <div className={passwordFormStyles.field}>
            <Label htmlFor="confirmPassword" className={passwordFormStyles.label}>
              Confirmar Nueva Contraseña *
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme la nueva contraseña"
                className={passwordFormStyles.inputPassword}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={passwordFormStyles.passwordToggle}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className={passwordFormStyles.footer}>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className={passwordFormStyles.cancelButton}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className={passwordFormStyles.submitButton}
            >
              <Lock className="h-4 w-4 mr-2" />
              Cambiar Contraseña
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
