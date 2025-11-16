/**
 * 📱 Componente de Prompt de Instalación PWA
 * 
 * Muestra un banner o botón para instalar la aplicación
 * como PWA en dispositivos móviles y desktop
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Download, X, Smartphone } from 'lucide-react';
import { setupInstallPrompt, isPWAInstalled, showPWAInstallInfo } from '../utils/register-service-worker';

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalado
    const pwaInfo = showPWAInstallInfo();
    
    if (pwaInfo.isInstalled) {
      console.log('✅ PWA ya está instalada');
      return;
    }

    // Configurar listener para el prompt de instalación
    const cleanup = setupInstallPrompt((prompt) => {
      setInstallPrompt(prompt);
      
      // Mostrar el prompt después de 5 segundos (no muy intrusivo)
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    });

    return cleanup;
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      console.log('⚠️ No hay prompt de instalación disponible');
      return;
    }

    try {
      setIsInstalling(true);
      
      // Mostrar el prompt nativo
      installPrompt.prompt();
      
      // Esperar la respuesta del usuario
      const { outcome } = await installPrompt.userChoice;
      
      console.log('📊 Resultado de instalación:', outcome);
      
      if (outcome === 'accepted') {
        console.log('✅ Usuario aceptó instalar la PWA');
        setShowPrompt(false);
      } else {
        console.log('❌ Usuario rechazó instalar la PWA');
      }
      
      // Limpiar el prompt
      setInstallPrompt(null);
    } catch (error) {
      console.error('❌ Error al instalar PWA:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    
    // No mostrar de nuevo en esta sesión
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // No mostrar si no hay prompt o si fue descartado
  if (!installPrompt || !showPrompt) {
    return null;
  }

  // Verificar si fue descartado en esta sesión
  if (sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50"
      >
        <Card className="border-2 border-green-200 dark:border-green-800 shadow-2xl bg-white dark:bg-gray-900">
          <CardContent className="p-4 sm:p-5">
            {/* Botón cerrar */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>

            <div className="flex items-start gap-3 mb-4">
              {/* Icono */}
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Smartphone className="h-6 w-6 text-white" />
              </div>

              {/* Contenido */}
              <div className="flex-1">
                <h3 className="font-semibold text-sm sm:text-base mb-1 text-gray-900 dark:text-gray-100">
                  Instalar Sistema CONAP
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Instala la aplicación en tu dispositivo para acceso rápido y funcionalidad offline
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                {isInstalling ? 'Instalando...' : 'Instalar'}
              </Button>
              
              <Button
                onClick={handleDismiss}
                variant="outline"
                size="sm"
                className="text-gray-600 dark:text-gray-400"
              >
                Ahora no
              </Button>
            </div>

            {/* Características */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-500">
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  Acceso rápido
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  Modo offline
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  Sin publicidad
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
