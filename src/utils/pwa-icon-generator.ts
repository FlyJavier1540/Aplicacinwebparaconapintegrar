/**
 * 🎨 Generador de iconos PWA desde el logo de CONAP
 * 
 * Genera iconos en diferentes tamaños para la PWA
 * usando el logo de CONAP como base
 */

import { conapLogo } from '../src/logo';

/**
 * Genera un icono de la PWA en un tamaño específico
 * @param size - Tamaño del icono (72, 96, 128, 144, 152, 192, 384, 512)
 * @returns Promise con la URL del icono generado
 */
export async function generatePWAIcon(size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Crear canvas
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('No se pudo obtener contexto 2D del canvas'));
        return;
      }

      // Fondo con gradiente verde CONAP
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#16a34a'); // green-600
      gradient.addColorStop(1, '#15803d'); // green-700
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Cargar y dibujar logo
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          // Calcular tamaño del logo (70% del icono)
          const logoSize = size * 0.7;
          const x = (size - logoSize) / 2;
          const y = (size - logoSize) / 2;

          // Dibujar logo centrado con fondo blanco circular
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, logoSize / 2 + 10, 0, Math.PI * 2);
          ctx.fill();

          // Dibujar logo
          ctx.drawImage(img, x, y, logoSize, logoSize);

          // Convertir canvas a blob
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve(url);
            } else {
              reject(new Error('No se pudo generar el blob del icono'));
            }
          }, 'image/png');
        } catch (error) {
          console.error('Error al dibujar logo en canvas:', error);
          reject(error);
        }
      };

      img.onerror = (error) => {
        console.error('Error al cargar logo:', error);
        reject(new Error('No se pudo cargar el logo'));
      };

      img.src = conapLogo;
    } catch (error) {
      console.error('Error al generar icono PWA:', error);
      reject(error);
    }
  });
}

/**
 * Genera todos los iconos necesarios para la PWA
 * @returns Promise con un mapa de tamaños y URLs
 */
export async function generateAllPWAIcons(): Promise<Map<number, string>> {
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  const icons = new Map<number, string>();

  try {
    const promises = sizes.map(async (size) => {
      const url = await generatePWAIcon(size);
      icons.set(size, url);
    });

    await Promise.all(promises);
    console.log('✅ Iconos PWA generados:', icons.size);
    return icons;
  } catch (error) {
    console.error('❌ Error al generar iconos PWA:', error);
    throw error;
  }
}

/**
 * Descarga un icono generado
 * @param size - Tamaño del icono
 * @param url - URL del icono
 */
export function downloadPWAIcon(size: number, url: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = `icon-${size}x${size}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Descarga todos los iconos generados
 * @param icons - Mapa de iconos generados
 */
export async function downloadAllPWAIcons(icons: Map<number, string>): Promise<void> {
  for (const [size, url] of icons.entries()) {
    downloadPWAIcon(size, url);
    // Esperar un poco entre descargas
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}
