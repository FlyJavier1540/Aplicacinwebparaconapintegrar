import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Eye, EyeOff } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import conapLogo from 'figma:asset/fdba91156d85a5c8ad358d0ec261b66438776557.png';
import { motion, AnimatePresence } from 'motion/react';
import { loginStyles } from '../styles/shared-styles';
import { authService } from '../utils/authService';

interface LoginProps {
  onLogin: (authResult: { user: any; token: string }) => void;
}

const wildlifeImages = [
  'https://images.unsplash.com/photo-1743041440513-69257a7dda41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'https://images.unsplash.com/photo-1682788820676-2d68c93d3346?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'https://images.unsplash.com/photo-1526646855395-20db6c4c04db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'https://images.unsplash.com/flagged/photo-1567431136661-e62430e95bb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'https://images.unsplash.com/photo-1756904113987-19a643686bfa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
];

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Cambiar imagen cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % wildlifeImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulación de llamada al servidor
    setTimeout(() => {
      const result = authService.authenticate(email, password);
      
      if (result.success && result.user && result.token) {
        // Pasar tanto el usuario como el token a App.tsx
        onLogin({
          user: result.user,
          token: result.token
        });
      } else {
        setError(result.error || 'Error de autenticación');
      }
      
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className={loginStyles.container}>
      {/* Toggle de tema en la esquina superior derecha - Touch-friendly */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className={loginStyles.themeToggle}
      >
        <ThemeToggle />
      </motion.div>

      {/* Galería de imágenes de fondo */}
      <div className={loginStyles.backgroundGallery}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2 }}
            className={loginStyles.backgroundImage}
          >
            <img
              src={wildlifeImages[currentImageIndex]}
              alt="Vida silvestre de Guatemala"
              className={loginStyles.backgroundImageImg}
            />
            {/* Overlay oscuro para mejor contraste - Más oscuro en móvil para mejor legibilidad */}
            <div className={loginStyles.backgroundOverlay}></div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Logo y título flotante arriba - Visible en todos los tamaños, responsive */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={loginStyles.floatingLogo}
      >
        <div className={loginStyles.logoContainer}>
          <img 
            src={conapLogo} 
            alt="CONAP Logo" 
            className={loginStyles.logoImage}
          />
        </div>
        <div className={loginStyles.logoText}>
          <h1 className={loginStyles.logoTitle}>CONAP</h1>
          <p className={loginStyles.logoSubtitle}>Consejo Nacional de Áreas Protegidas</p>
        </div>
      </motion.div>

      {/* Indicadores de imagen - Solo visualización */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className={loginStyles.imageIndicators}
        aria-label={`Imagen ${currentImageIndex + 1} de ${wildlifeImages.length}`}
      >
        {wildlifeImages.map((_, index) => (
          <div
            key={index}
            className={loginStyles.indicator(index === currentImageIndex)}
            aria-hidden="true"
          />
        ))}
      </motion.div>

      {/* Formulario de login centrado - Responsive */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={loginStyles.formContainer}
      >
          <Card className={loginStyles.card}>
          <CardHeader className={loginStyles.cardHeader}>
            {/* Logo CONAP - Visible en todas las pantallas */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className={loginStyles.cardLogo}
            >
              <img
                src={conapLogo} 
                alt="CONAP Logo" 
                className={loginStyles.cardLogoImage}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <CardTitle className={loginStyles.cardTitle}>
                Iniciar Sesión
              </CardTitle>
              <CardDescription className={loginStyles.cardDescription}>
                Sistema de Guardarecursos
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent className={loginStyles.cardContent}>
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onSubmit={handleSubmit} 
              className={loginStyles.form}
            >
              <div className={loginStyles.field}>
                <Label htmlFor="email" className={loginStyles.label}>Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@conap.gob.gt"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={loginStyles.input}
                />
              </div>
              
              <div className={loginStyles.field}>
                <Label htmlFor="password" className={loginStyles.label}>Contraseña</Label>
                <div className={loginStyles.passwordContainer}>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={loginStyles.inputPassword}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={loginStyles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className={loginStyles.passwordToggleIcon} />
                    ) : (
                      <Eye className={loginStyles.passwordToggleIcon} />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className={loginStyles.alert}>
                  <AlertDescription className={loginStyles.alertDescription}>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className={loginStyles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Iniciando sesión...
                  </motion.span>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </motion.form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}