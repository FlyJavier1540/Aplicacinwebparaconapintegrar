import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Camera, Upload } from 'lucide-react';
import { formStyles } from '../styles/shared-styles';

export interface FotografiaFormData {
  url: string;
  descripcion: string;
  latitud: string;
  longitud: string;
}

interface FormularioFotografiaProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FotografiaFormData) => void;
  initialData?: FotografiaFormData;
}

export function FormularioFotografia({ isOpen, onClose, onSubmit, initialData }: FormularioFotografiaProps) {
  const [formData, setFormData] = useState<FotografiaFormData>(
    initialData || {
      url: '',
      descripcion: '',
      latitud: '',
      longitud: ''
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.url && formData.descripcion) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      url: '',
      descripcion: '',
      latitud: '',
      longitud: ''
    });
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={formStyles.dialogContent}>
        <DialogHeader className={formStyles.dialogHeader}>
          <DialogTitle className={formStyles.dialogTitle}>
            Agregar Fotografía
          </DialogTitle>
          <DialogDescription className={formStyles.dialogDescription}>
            Complete la información de la fotografía
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className={formStyles.form}>
          <div className={formStyles.section}>
            <div className={formStyles.gridSingle}>
              {/* Seleccionar Archivo */}
              <div className={formStyles.field}>
                <Label htmlFor="archivo" className={formStyles.label}>
                  Seleccionar Archivo *
                </Label>
                <div className="relative">
                  <input
                    id="archivo"
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {formData.url ? '✓ Imagen seleccionada' : 'Haz clic para seleccionar una imagen'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      PNG, JPG, GIF
                    </p>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className={formStyles.field}>
                <Label htmlFor="descripcion" className={formStyles.label}>
                  Descripción *
                </Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Describa la fotografía..."
                  rows={3}
                  required
                  className="resize-none"
                />
              </div>

              {/* Coordenadas GPS */}
              <div className={formStyles.grid}>
                <div className={formStyles.field}>
                  <Label htmlFor="latitud" className={formStyles.label}>
                    Latitud
                  </Label>
                  <Input
                    id="latitud"
                    type="number"
                    step="0.000001"
                    value={formData.latitud}
                    onChange={(e) => setFormData({ ...formData, latitud: e.target.value })}
                    placeholder="14.6349"
                    className={formStyles.input}
                  />
                </div>

                <div className={formStyles.field}>
                  <Label htmlFor="longitud" className={formStyles.label}>
                    Longitud
                  </Label>
                  <Input
                    id="longitud"
                    type="number"
                    step="0.000001"
                    value={formData.longitud}
                    onChange={(e) => setFormData({ ...formData, longitud: e.target.value })}
                    placeholder="-90.5069"
                    className={formStyles.input}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={formStyles.footer}>
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className={formStyles.cancelButton}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!formData.url || !formData.descripcion}
              className={formStyles.submitButton}
            >
              <Camera className="h-4 w-4 mr-2" />
              Agregar Fotografía
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
