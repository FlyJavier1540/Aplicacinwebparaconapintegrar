import { AreaProtegida } from '../types';
import { Card, CardContent } from './ui/card';
import { MapPin, Leaf, TreePine } from 'lucide-react';
import { motion } from 'motion/react';
import { cardStyles, textStyles, areaDetalleStyles } from '../styles/shared-styles';

interface AreaProtegidaDetalleProps {
  area: AreaProtegida | null;
  isSimplified?: boolean;
  allAreas?: AreaProtegida[];
}

export function AreaProtegidaDetalle({ area, isSimplified = false, allAreas = [] }: AreaProtegidaDetalleProps) {
  if (!area) {
    return null;
  }

  return (
    <div className={areaDetalleStyles.container}>
      {/* Título minimalista */}
      <motion.div 
        className={areaDetalleStyles.title}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className={areaDetalleStyles.titleText}>{area.nombre}</h2>
      </motion.div>

      {/* Descripción minimalista */}
      <motion.p
        className={`${textStyles.muted} ${areaDetalleStyles.description}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {area.descripcion}
      </motion.p>

      {/* Grid: Mapa decorativo + Cards de información */}
      <div className={areaDetalleStyles.grid}>
        {/* Mapa decorativo minimalista */}
        <motion.div 
          className={areaDetalleStyles.mapContainer}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Círculos concéntricos decorativos */}
          <div className={areaDetalleStyles.mapCircles}>
            {/* Círculo exterior (línea punteada) */}
            <div className={areaDetalleStyles.circleOuter} />
            
            {/* Círculo medio */}
            <div className={areaDetalleStyles.circleMiddle} />
            
            {/* Punto central */}
            <div className={areaDetalleStyles.circleCenterPoint} />
          </div>
        </motion.div>

        {/* Columna de información */}
        <motion.div 
          className={areaDetalleStyles.infoColumn}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Ubicación */}
          <Card className={areaDetalleStyles.infoCard}>
            <div className={areaDetalleStyles.infoCardHeaderBlue}>
              <div className={areaDetalleStyles.infoCardHeaderContent}>
                <MapPin className={areaDetalleStyles.infoCardHeaderIcon} />
                <span className={areaDetalleStyles.infoCardHeaderText}>Ubicación</span>
              </div>
            </div>
            <CardContent className={areaDetalleStyles.infoCardContent}>
              <p className={textStyles.primaryDark}>{area.departamento}</p>
            </CardContent>
          </Card>

          {/* Extensión */}
          <Card className={areaDetalleStyles.infoCard}>
            <div className={areaDetalleStyles.infoCardHeaderGreen}>
              <div className={areaDetalleStyles.infoCardHeaderContent}>
                <Leaf className={areaDetalleStyles.infoCardHeaderIcon} />
                <span className={areaDetalleStyles.infoCardHeaderText}>Extensión</span>
              </div>
            </div>
            <CardContent className={areaDetalleStyles.infoCardContent}>
              <p className={textStyles.primaryDark}>
                {area.extension.toLocaleString()} hectáreas
              </p>
            </CardContent>
          </Card>

          {/* Ecosistema Principal */}
          {area.ecosistemas && area.ecosistemas.length > 0 && (
            <Card className={areaDetalleStyles.infoCard}>
              <div className={areaDetalleStyles.infoCardHeaderCyan}>
                <div className={areaDetalleStyles.infoCardHeaderContent}>
                  <TreePine className={areaDetalleStyles.infoCardHeaderIcon} />
                  <span className={areaDetalleStyles.infoCardHeaderText}>Ecosistema Principal</span>
                </div>
              </div>
              <CardContent className={areaDetalleStyles.infoCardContent}>
                <p className={textStyles.primaryDark}>{area.ecosistemas[0]}</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
