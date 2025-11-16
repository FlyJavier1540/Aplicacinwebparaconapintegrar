/**
 * 🎨 Generador dinámico de manifest PWA
 * 
 * Genera el manifest.json simplificado para PWA
 */

/**
 * Crea un icono SVG simple como data URL
 */
function createSimpleSVGIcon(size: number): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#16a34a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#15803d;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size*0.35}" fill="white" opacity="0.9"/>
      <text x="50%" y="50%" font-family="Arial" font-size="${size*0.4}" font-weight="bold" fill="#16a34a" text-anchor="middle" dominant-baseline="central">C</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Genera el manifest PWA simplificado
 */
export async function generatePWAManifest(): Promise<string> {
  try {
    // Generar iconos SVG simples
    const icon192 = createSimpleSVGIcon(192);
    const icon512 = createSimpleSVGIcon(512);

    const manifest = {
      name: 'Sistema CONAP - Guardarrecursos',
      short_name: 'CONAP',
      description: 'Sistema de gestión de guardarrecursos del Consejo Nacional de Áreas Protegidas de Guatemala',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#16a34a',
      orientation: 'any',
      scope: '/',
      icons: [
        {
          src: icon192,
          sizes: '192x192',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        },
        {
          src: icon512,
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        }
      ],
      categories: ['business', 'productivity', 'utilities'],
      display_override: ['window-controls-overlay', 'standalone']
    };

    return JSON.stringify(manifest, null, 2);
  } catch (error) {
    console.error('Error al generar manifest:', error);
    throw error;
  }
}

/**
 * Registra el manifest dinámicamente en el DOM
 */
export async function registerDynamicManifest(): Promise<void> {
  try {
    console.log('🔄 Generando manifest PWA...');
    
    const manifestJSON = await generatePWAManifest();
    const manifestBlob = new Blob([manifestJSON], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(manifestBlob);

    // Buscar o crear el link del manifest
    let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    
    if (manifestLink) {
      // Revocar la URL anterior si existe
      if (manifestLink.href.startsWith('blob:')) {
        URL.revokeObjectURL(manifestLink.href);
      }
      manifestLink.href = manifestURL;
    } else {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = manifestURL;
      document.head.appendChild(manifestLink);
    }

    console.log('✅ Manifest PWA registrado correctamente');
  } catch (error) {
    console.error('❌ Error al registrar manifest:', error);
  }
}