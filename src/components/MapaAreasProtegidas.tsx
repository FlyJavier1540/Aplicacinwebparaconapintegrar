import { useState } from 'react';
import { AreaProtegida } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MapPin } from 'lucide-react';
import { cardStyles } from '../styles/shared-styles';
import { areasProtegidasService } from '../utils/areasProtegidasService';

interface MapaAreasProtegidasProps {
  areas: AreaProtegida[];
  onAreaSelect: (area: AreaProtegida) => void;
  selectedAreaId?: string | null;
  title?: string;
  className?: string;
  showLegend?: boolean;
  centered?: boolean;
}

/**
 * Componente de mapa unificado para visualizar áreas protegidas de Guatemala.
 * Este componente es reutilizable para diferentes roles (Administrador, Coordinador, Guardarecurso).
 * 
 * @param areas - Array de áreas protegidas a mostrar en el mapa
 * @param onAreaSelect - Callback cuando se selecciona un área
 * @param selectedAreaId - ID del área actualmente seleccionada
 * @param title - Título personalizado del mapa (opcional)
 * @param className - Clases CSS adicionales (opcional)
 */
export function MapaAreasProtegidas({ 
  areas, 
  onAreaSelect, 
  selectedAreaId,
  title = 'Mapa de Áreas Protegidas',
  className = '',
  showLegend = true,
  centered = false
}: MapaAreasProtegidasProps) {
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);

  // Calcular viewBox usando el servicio
  let viewBox = areasProtegidasService.getDefaultViewBox();
  if (centered && areas.length === 1) {
    viewBox = areasProtegidasService.calculateCenteredViewBox(areas[0]);
  }

  return (
    <Card className={`h-full ${cardStyles.base} bg-white dark:bg-gray-900 flex flex-col overflow-hidden ${className}`}>
      <CardContent className="flex-1 relative p-2 sm:p-3 md:p-4 min-h-0">
        <svg
          viewBox={viewBox}
          className="w-full h-full border rounded-md sm:rounded-lg bg-green-50 dark:bg-green-950/20"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          style={{ touchAction: 'pan-y' }}
        >
          {/* Contorno simplificado de Guatemala (solo si no está centrado) */}
          {!centered && (
            <>
              <path
                d="M150 200 L250 180 L350 190 L450 200 L550 220 L600 280 L580 350 L520 400 L450 420 L350 430 L250 420 L180 380 L150 320 Z"
                fill="#e8f5e8"
                stroke="#22c55e"
                strokeWidth="2"
                className="dark:fill-green-950/40 transition-colors duration-300"
              />
              
              {/* Departamentos simplificados para contexto geográfico */}
              <path d="M150 200 L250 180 L280 240 L220 260 Z" fill="#f0f9ff" stroke="#94a3b8" strokeWidth="1" opacity="0.5" className="dark:fill-blue-950/20" />
              <path d="M250 180 L350 190 L380 250 L280 240 Z" fill="#f0f9ff" stroke="#94a3b8" strokeWidth="1" opacity="0.5" className="dark:fill-blue-950/20" />
              <path d="M350 190 L450 200 L480 260 L380 250 Z" fill="#f0f9ff" stroke="#94a3b8" strokeWidth="1" opacity="0.5" className="dark:fill-blue-950/20" />
            </>
          )}
          
          {/* Marcadores de áreas protegidas */}
          {areas.map((area) => {
            // Calcular coordenadas SVG usando el servicio
            const { x, y } = areasProtegidasService.calculateSVGCoordinates(area.coordenadas);
            const isSelected = selectedAreaId === area.id;
            const isHovered = hoveredArea === area.id;
            // Si está centrado, hacer el punto más grande
            const radius = centered ? 20 : 10;
            const strokeWidth = centered ? 4 : 2.5;
            
            return (
              <g key={area.id}>
                {/* Círculo de contexto de fondo (solo en modo centrado) */}
                {centered && (
                  <>
                    <circle
                      cx={x}
                      cy={y}
                      r={80}
                      fill="#10b981"
                      opacity="0.1"
                      className="dark:fill-emerald-400"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={80}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      opacity="0.3"
                      strokeDasharray="5,5"
                      className="dark:stroke-emerald-400"
                    />
                  </>
                )}
                
                {/* Anillo de pulso (solo en modo centrado) */}
                {centered && (
                  <>
                    <circle
                      cx={x}
                      cy={y}
                      r={radius}
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="2"
                      opacity="0.6"
                    >
                      <animate
                        attributeName="r"
                        from={radius}
                        to={radius * 2.5}
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        from="0.6"
                        to="0"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </>
                )}
                
                {/* Círculo principal con interacción */}
                <circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={isSelected ? "#dc2626" : "#059669"}
                  stroke="#ffffff"
                  strokeWidth={strokeWidth}
                  style={{
                    cursor: centered ? 'default' : 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => !centered && onAreaSelect(area)}
                  onMouseEnter={() => !centered && setHoveredArea(area.id)}
                  onMouseLeave={() => setHoveredArea(null)}
                  opacity={isHovered ? 0.8 : 1}
                >
                  {centered && (
                    <animate
                      attributeName="r"
                      values={`${radius};${radius * 1.1};${radius}`}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  )}
                </circle>
                
                {/* Tooltip con nombre del área al hacer hover */}
                {isHovered && (
                  <g style={{ pointerEvents: 'none' }}>
                    <rect
                      x={x - (area.nombre.length * 3.5)}
                      y={y - 35}
                      width={area.nombre.length * 7}
                      height="20"
                      fill="white"
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      rx="4"
                      className="dark:fill-gray-800 dark:stroke-gray-700"
                      opacity="0.95"
                    />
                    <text
                      x={x}
                      y={y - 20}
                      textAnchor="middle"
                      fill="currentColor"
                      className="dark:fill-gray-200"
                      style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        pointerEvents: 'none'
                      }}
                    >
                      {area.nombre}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
          
          {/* Leyenda para pantallas grandes (Desktop) */}
          {showLegend && (
            <g transform="translate(20, 450)" className="hidden sm:block" style={{ pointerEvents: 'none' }}>
              <rect x="0" y="0" width="200" height="120" fill="white" stroke="#e5e7eb" strokeWidth="1" rx="8" className="dark:fill-gray-800 dark:stroke-gray-700" opacity="0.95" />
              <text x="10" y="20" fill="currentColor" className="dark:fill-gray-200" style={{ fontSize: '14px', fontWeight: '500' }}>Leyenda</text>
              <circle cx="20" cy="40" r="6" fill="#059669" stroke="white" strokeWidth="2" />
              <text x="35" y="45" fill="currentColor" className="dark:fill-gray-300" style={{ fontSize: '12px' }}>Área Protegida</text>
              <circle cx="20" cy="65" r="6" fill="#dc2626" stroke="white" strokeWidth="2" />
              <text x="35" y="70" fill="currentColor" className="dark:fill-gray-300" style={{ fontSize: '12px' }}>Área Seleccionada</text>
              <text x="10" y="95" fill="currentColor" className="dark:fill-gray-400" style={{ fontSize: '10px' }}>Click en los puntos para</text>
              <text x="10" y="110" fill="currentColor" className="dark:fill-gray-400" style={{ fontSize: '10px' }}>ver detalles del área</text>
            </g>
          )}
          
          {/* Leyenda para pantallas pequeñas (Móvil) */}
          {showLegend && (
            <g transform="translate(10, 500)" className="sm:hidden" style={{ pointerEvents: 'none' }}>
              <rect x="0" y="0" width="180" height="85" fill="white" stroke="#e5e7eb" strokeWidth="1" rx="6" className="dark:fill-gray-800 dark:stroke-gray-700" opacity="0.95" />
              <text x="8" y="18" fill="currentColor" className="dark:fill-gray-200" style={{ fontSize: '12px', fontWeight: '500' }}>Leyenda</text>
              <circle cx="16" cy="35" r="5" fill="#059669" stroke="white" strokeWidth="2" />
              <text x="28" y="39" fill="currentColor" className="dark:fill-gray-300" style={{ fontSize: '10px' }}>Área Protegida</text>
              <circle cx="16" cy="55" r="5" fill="#dc2626" stroke="white" strokeWidth="2" />
              <text x="28" y="59" fill="currentColor" className="dark:fill-gray-300" style={{ fontSize: '10px' }}>Seleccionada</text>
              <text x="8" y="75" fill="currentColor" className="dark:fill-gray-400" style={{ fontSize: '9px' }}>Toca para ver detalles</text>
            </g>
          )}
        </svg>
      </CardContent>
    </Card>
  );
}
