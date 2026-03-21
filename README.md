# 🎮 TicTac PartyPack

Una aplicación de juegos de fiesta móvil con una bomba de cuenta regresiva y múltiples mini-juegos para disfrutar con amigos.

## 📱 Descripción

TicTac PartyPack es un juego de fiesta móvil donde los jugadores compiten contra el tiempo completando diversos desafíos antes de que la bomba "explote". Perfecto para reuniones, fiestas y eventos sociales.

### ✨ Características principales

- 🎲 **11 mini-juegos únicos** con diferentes niveles de dificultad
- ⏱️ **Sistema de bomba con temporizador** configurable
- 🌍 **Soporte multiidioma** (Español e Inglés)
- 🎨 **Interfaz intuitiva** con TailwindCSS y NativeWind
- 🔊 **Efectos de sonido** inmersivos
- ⚙️ **Modos de juego personalizables**
- 📱 **Optimizado para móviles** con React Native

## 🎯 Mini-Juegos Disponibles

1. **Sílabas** - Di palabras que cumplan con instrucciones específicas (empieza con, termina en, contiene)
2. **Piedra, Papel o Tijera** - Gana para pasar la bomba
3. **Cadena de Palabras** - Encadena palabras usando las últimas letras
4. **Adivina el Número** - Sincroniza tu respuesta con otro jugador
5. **Categorías** - Nombra elementos de una categoría específica
6. **Multiplica** - Di el siguiente múltiplo del número mostrado
7. **Lanzar Moneda** - Adivina cara o cruz
8. **¡No mires allá!** - Duelo de miradas y direcciones
9. **Abecedario** - Sigue el orden alfabético en una categoría
10. **Letra Prohibida** - Di palabras sin usar una letra específica
11. **Mayor Que** - Comparaciones numéricas

## 🚀 Instalación

### Requisitos previos

- Node.js (v16 o superior)
- npm o yarn
- Expo CLI
- Dispositivo móvil con Expo Go (para pruebas) o emulador

### Pasos de instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/TicTacPartyPack.git
cd TicTacPartyPack
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm start
```

4. Escanea el código QR con Expo Go (Android) o la app de Cámara (iOS)

## 📦 Scripts disponibles

- `npm start` - Inicia el servidor de desarrollo de Expo
- `npm run android` - Ejecuta la app en un emulador/dispositivo Android
- `npm run ios` - Ejecuta la app en un simulador/dispositivo iOS
- `npm run web` - Ejecuta la app en el navegador web

## 🎮 Modos de Juego

### 🎲 Modo Clásico
Mezcla aleatoria de todos los mini-juegos para una experiencia completa y variada.

### 🎯 Modo A Medida
Selecciona tus mini-juegos favoritos y personaliza la configuración específica de cada uno:
- Rango de números para "Adivina el Número"
- Multiplicadores mínimos y máximos
- Cantidad de palabras para "Letra Prohibida"

### 💣 Modo Solo Bomba
Sin retos predefinidos, solo la bomba con temporizador. Ideal para crear tus propios desafíos externos:
- Desafíos físicos
- Preguntas personalizadas
- Actividades creativas

## ⚙️ Configuración

Personaliza tu experiencia desde la pantalla de ajustes:

- **Idioma**: Español o Inglés
- **Tiempo mínimo de bomba**: Configurable en segundos
- **Tiempo máximo de bomba**: Configurable en segundos
- **Fondo de pantalla**: Personaliza la apariencia

## 🚢 Deployment con Expo

### Construcción para producción

Este proyecto utiliza **EAS Build** (Expo Application Services) para generar builds de producción.

#### 1. Configurar EAS CLI

```bash
# Instalar EAS CLI globalmente
npm install -g eas-cli

# Iniciar sesión en tu cuenta de Expo
eas login

# Configurar el proyecto (si aún no lo has hecho)
eas build:configure
```

#### 2. Construir para Android

```bash
# Build APK para pruebas internas
eas build --platform android --profile preview

# Build AAB para Google Play Store
eas build --platform android --profile production
```

#### 3. Construir para iOS

```bash
# Build para simulador (desarrollo)
eas build --platform ios --profile preview

# Build para App Store
eas build --platform ios --profile production
```

> **Nota**: Para builds de iOS necesitarás una cuenta de Apple Developer y configurar los certificados correspondientes.

#### 4. Configuración de perfiles de build

El archivo [eas.json](eas.json) contiene los perfiles de build. Puedes personalizarlos según tus necesidades:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

### Publicación OTA (Over-The-Air)

Para actualizaciones rápidas sin recompilar la app completa:

```bash
# Publicar actualización
eas update --branch production --message "Descripción de la actualización"

# Publicar en branch específica
eas update --branch preview --message "Testing new features"
```

### Distribución

#### Android
- **APK**: Ideal para distribución interna o testing
- **AAB**: Requerido para Google Play Store
- Descarga el build desde tu dashboard de Expo y sube a Google Play Console

#### iOS
- Descarga el `.ipa` desde tu dashboard de Expo
- Sube a App Store Connect usando Transporter o Xcode

### Testing con TestFlight / Google Play Internal Testing

```bash
# Build para internal testing
eas build --platform android --profile preview
eas build --platform ios --profile preview

# Descarga los archivos y súbelos a:
# - Google Play Console → Internal Testing
# - App Store Connect → TestFlight
```

### Variables de entorno

Si necesitas configurar variables de entorno para producción:

1. Crea un archivo `.env.production`:
```bash
API_URL=https://tu-api.com
APP_ENV=production
```

2. Actualiza [app.json](app.json) para incluir las variables:
```json
{
  "expo": {
    "extra": {
      "apiUrl": process.env.API_URL
    }
  }
}
```

### Recursos útiles

- [Documentación EAS Build](https://docs.expo.dev/build/introduction/)
- [Documentación EAS Submit](https://docs.expo.dev/submit/introduction/)
- [Guía de publicación Android](https://docs.expo.dev/submit/android/)
- [Guía de publicación iOS](https://docs.expo.dev/submit/ios/)

## 🛠️ Tecnologías utilizadas

- **[React Native](https://reactnative.dev/)** (0.81.5) - Framework para apps móviles
- **[React](https://react.dev/)** (19.1.0) - Biblioteca UI
- **[Expo](https://expo.dev/)** (~54.0) - Plataforma de desarrollo
- **[Expo Router](https://docs.expo.dev/router/introduction/)** (~6.0) - Navegación basada en archivos
- **[TypeScript](https://www.typescriptlang.org/)** (~5.9) - Tipado estático
- **[TailwindCSS](https://tailwindcss.com/)** + **[NativeWind](https://www.nativewind.dev/)** (^4.2) - Estilos utility-first
- **[i18next](https://www.i18next.com/)** + **[react-i18next](https://react.i18next.com/)** - Internacionalización
- **[Expo AV](https://docs.expo.dev/versions/latest/sdk/av/)** - Gestión de audio
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** - Persistencia de datos

## 📂 Estructura del Proyecto

```
TicTacPartyPack/
├── app/                    # Pantallas de la aplicación (Expo Router)
│   ├── index.tsx          # Pantalla principal
│   ├── _layout.tsx        # Layout raíz con providers
│   ├── game/              # Pantallas de juego
│   │   ├── config.tsx     # Configuración de partida
│   │   └── index.tsx      # Pantalla de juego activo
│   └── settings/          # Pantalla de ajustes
│       └── index.tsx
├── components/            # Componentes reutilizables
│   ├── BackgroundWrapper.tsx
│   ├── Bomb.tsx
│   ├── ChallengeDisplay.tsx
│   ├── CoinFlipChallenge.tsx
│   ├── GameInstructions.tsx
│   └── NavigationReady.tsx
├── games/                 # Lógica de cada mini-juego
│   ├── alphabet.ts
│   ├── biggerThan.ts
│   ├── categories.ts
│   ├── coinFlip.ts
│   ├── forbiddenLetter.ts
│   ├── guessNumber.ts
│   ├── lookAway.ts
│   ├── multiply.ts
│   ├── rockPaperScissors.ts
│   ├── syllables.ts
│   └── wordChain.ts
├── services/              # Servicios compartidos
│   ├── SoundManager.ts    # Gestión de audio
│   └── gameRouter.ts      # Enrutamiento de juegos
├── store/                 # Estado global
│   └── SettingsContext.tsx
├── locales/               # Traducciones
│   ├── en.json
│   └── es.json
├── assets/                # Recursos multimedia
│   ├── backgrounds/
│   ├── images/
│   └── sounds/
├── i18n.ts               # Configuración i18n
└── package.json
```

## 🎨 Capturas de pantalla

_Próximamente_

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si encuentras un bug o tienes una sugerencia:

1. Abre un issue describiendo el problema o la mejora
2. Si deseas contribuir código, crea un fork del proyecto
3. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
4. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
5. Push a la rama (`git push origin feature/AmazingFeature`)
6. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y está protegido por derechos de autor.

## 👤 Autor

Desarrollado con ❤️ para disfrutar con amigos y familia.

## 🙏 Agradecimientos

- Expo team por su increíble framework
- Comunidad de React Native
- Todos los beta testers que ayudaron a mejorar el juego

---

**¿Te diviertes con TicTac PartyPack?** ⭐ ¡Compártelo con tus amigos!
