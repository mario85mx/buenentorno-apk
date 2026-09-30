# Compilación de Buen Entorno para iOS

Esta guía genera un `.ipa` de producción en una Mac mediante EAS Build local. Incluye el envío opcional a TestFlight. Ejecutar los comandos desde `apk/`, salvo indicación contraria.

## Configuración del proyecto

Valores revisados el 26 de septiembre de 2026:

| Dato | Valor |
| --- | --- |
| Bundle identifier | `com.mario85mx.buenentornoapp` |
| Proyecto EAS | `a7d1fb21-7243-4504-831c-e7b9e9012897` |
| Versión visible en `app.json` | `1.0.4` |
| Expo / React Native en `package.json` | `~57.0.25` / `0.86.3` |
| Perfil de compilación | `production` |
| API del perfil | `https://api.buenentorno.com` |
| Fuente de número de build | EAS remoto, con `autoIncrement: true` |

La versión visible se configura en `app.json`, no en `package.json`. El número de compilación iOS (`CFBundleVersion`) se consulta en EAS; no se debe deducir del nombre de un `.ipa` existente.

## 1. Preparar la Mac

Se necesitan Xcode completo con sus componentes iOS, Node.js, pnpm, CocoaPods y fastlane. Para firmar y distribuir, también se requiere acceso al proyecto Expo y al equipo de Apple Developer con membresía activa.

Herramientas observadas en esta Mac al documentar el proceso (no equivalen a certificar un build nuevo): Xcode `27.0` (`27A266a`), Node `22.19.0`, pnpm `10.17.1`, CocoaPods `1.16.2` y fastlane `2.240.1`.

```bash
xcodebuild -version
xcode-select -p
node --version
pnpm --version
pod --version
fastlane --version
npx eas-cli --version
```

`xcode-select -p` debe apuntar al Xcode completo, por ejemplo `/Applications/Xcode.app/Contents/Developer`. Si apunta solo a Command Line Tools, seleccionar la instalación correcta:

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

Abrir Xcode para completar la instalación de componentes y aceptar su licencia si lo solicita. Si faltan CocoaPods o fastlane y se usa Homebrew:

```bash
brew install cocoapods fastlane
```

El build local utiliza las herramientas instaladas en la Mac. Consultar las [limitaciones de EAS local](https://docs.expo.dev/build-reference/local-builds/) antes de intentar controlar sus versiones con `eas.json`.

## 2. Preparar código y configuración

```bash
git status --short
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
pnpm exec expo config --type public
```

Usar el commit que se desea distribuir y revisar cualquier cambio pendiente. Confirmar en la configuración resuelta el bundle identifier y los plugins.

El perfil `production` de `eas.json` incluye:

```json
{
  "autoIncrement": true,
  "env": {
    "EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK": "1",
    "EXPO_PUBLIC_API_URL": "https://api.buenentorno.com"
  }
}
```

Revisar también las variables del entorno y archivos `.env`: `src/services/api.ts` admite `EXPO_PUBLIC_API_URL_IOS`, que tiene prioridad sobre la URL general. No debe apuntar a una IP local en un build de producción. Las variables `EXPO_PUBLIC_*` se incorporan al cliente; no colocar secretos en ellas.

La carpeta `ios/` está ignorada por Git. Los ajustes reproducibles deben mantenerse en `app.json` y los config plugins:

- `plugins/withIosPodDeploymentTarget.js` eleva a `16.4` los deployment targets de Pods que no tengan valor o tengan uno inferior; conserva los superiores. Esto no establece por sí solo la versión mínima de toda la app.
- `expo-build-properties` tiene `ios.enableSceneSupport: true`.
- `ITSAppUsesNonExemptEncryption` está configurado en `false`.

No depender de cambios manuales dentro de `ios/` para el build EAS, que regenera el proyecto nativo cuando esa carpeta no está incluida.

## 3. Confirmar cuentas, firma y versión

```bash
npx eas-cli login
npx eas-cli whoami
npx eas-cli credentials --platform ios
npx eas-cli build:version:get --platform ios --profile production
```

En credenciales, seleccionar `production` y el equipo Apple correspondiente a Buen Entorno. Revisar el certificado de distribución y el provisioning profile para `com.mario85mx.buenentornoapp`. Conservar las credenciales válidas; renovar las vencidas siguiendo el asistente. No guardar contraseñas, certificados privados ni claves de App Store Connect en Git.

Para una nueva versión pública, actualizar `expo.version` en `app.json` según la versión que se vaya a publicar. Para otra compilación de la misma versión en TestFlight puede conservarse la versión visible y cambiar el número de build.

EAS administra e incrementa el build con la configuración actual. Comparar el valor remoto con el último cargado en App Store Connect. Si está desfasado, usar `npx eas-cli build:version:set`, seleccionar iOS e inicializar con el último número utilizado antes de construir. `build:version:sync` descarga el valor remoto al proyecto local; no corrige el contador remoto. Véase [administración de versiones](https://docs.expo.dev/build-reference/app-versions/).

## 4. Generar el `.ipa` local

Guardar los nuevos artefactos fuera del repositorio. Actualmente hay `.ipa` versionados y `.gitignore` no contiene una regla general para ellos; evitar sobrescribirlos o agregar otros por accidente.

```bash
mkdir -p ../artifacts-ios
npx eas-cli build \
  --platform ios \
  --profile production \
  --local \
  --output ../artifacts-ios/buen-entorno.ipa
```

Elegir otro nombre de salida si ya existe un artefacto que se necesita conservar. Ejecutar inicialmente en modo interactivo para resolver los pasos de firma. `--non-interactive` solo sirve cuando las credenciales y la configuración ya están completas.

Esperar a que termine correctamente y anotar el número de build asignado. Aunque la compilación se ejecuta en la Mac, necesita conexión para dependencias y servicios de Expo/Apple. El [flujo local de EAS](https://docs.expo.dev/build-reference/local-builds/) también permite conservar el directorio de trabajo para diagnosticar errores.

Como alternativa, compilar en EAS Cloud omitiendo `--local` y `--output`:

```bash
npx eas-cli build --platform ios --profile production
```

Este comando envía el proyecto a EAS y genera un build remoto.

## 5. Verificar el resultado

```bash
ls -lh ../artifacts-ios/buen-entorno.ipa
unzip -t ../artifacts-ios/buen-entorno.ipa
shasum -a 256 ../artifacts-ios/buen-entorno.ipa
```

Para comprobar los metadatos y la firma del contenido:

```bash
IOS_VERIFY_DIR=$(mktemp -d /tmp/buen-entorno-ios.XXXXXX)
unzip -q ../artifacts-ios/buen-entorno.ipa -d "$IOS_VERIFY_DIR"
for IOS_APP_PATH in "$IOS_VERIFY_DIR"/Payload/*.app; do
  /usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$IOS_APP_PATH/Info.plist"
  /usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$IOS_APP_PATH/Info.plist"
  /usr/libexec/PlistBuddy -c 'Print :CFBundleVersion' "$IOS_APP_PATH/Info.plist"
  codesign --verify --deep --strict --verbose=2 "$IOS_APP_PATH"
done
```

Confirmar identificador, versión visible y build esperado. Esta comprobación local no sustituye la validación de App Store Connect. Guardar junto al artefacto su checksum, commit (`git rev-parse HEAD`), versiones de herramientas y número de build.

## 6. Envío opcional a TestFlight

Solo después de verificar el artefacto, cargar el archivo concreto:

```bash
npx eas-cli submit --platform ios --path ../artifacts-ios/buen-entorno.ipa
```

Actualmente `eas.json` no define un perfil `submit`. Seguir el asistente para seleccionar la app y las credenciales de App Store Connect. El Apple ID numérico de la app y el equipo deben obtenerse de la cuenta correcta; no están documentados en este repositorio.

Tras el procesamiento, abrir [App Store Connect](https://appstoreconnect.apple.com/), seleccionar Buen Entorno y revisar TestFlight. Completar los datos que Apple solicite y habilitar el grupo de pruebas correspondiente. Subir el binario no publica automáticamente la app en App Store: la versión pública requiere seleccionar el build y enviarlo a revisión. Referencia: [EAS Submit para iOS](https://docs.expo.dev/submit/ios/).

Probar desde TestFlight en un dispositivo físico: inicio y persistencia de sesión, selección de condominio, avisos, documentos y PDF, cámara/QR, compartir archivos, permisos y apariencia clara/oscura. Como la app declara soporte de tablet, validar también iPad antes de publicar.

## Desarrollo en simulador

`pnpm ios` inicia Expo para desarrollo; no genera un `.ipa` de distribución. Para los servicios locales del proyecto, consultar [Servicios locales](../SERVICIOS.md). El `.ipa` de producción está destinado a distribución mediante Apple, no al simulador.

## Problemas frecuentes

| Problema | Acción |
| --- | --- |
| Xcode no encontrado o SDK incompatible | Revisar `xcode-select -p`, `xcodebuild -version` y los componentes instalados. |
| `pod` o `fastlane` no encontrado | Instalar la herramienta y verificar que esté disponible en el `PATH` de la terminal. |
| Error de deployment target en un Pod | Comprobar que se ejecutó `withIosPodDeploymentTarget` y revisar el error del Pod; el plugin no reduce requisitos superiores a `16.4`. |
| Certificado o provisioning profile inválido | Revisar equipo, identificador y vigencia con `eas credentials --platform ios`. |
| Número de build duplicado | Comparar App Store Connect y EAS remoto; corregir el contador si corresponde y generar otro build. |
| La app intenta usar una API local | Revisar perfil, variables `EXPO_PUBLIC_API_URL*` y `.env`; recompilar después de corregirlas. |
| Falla del build local | Repetir el comando anteponiendo `EAS_LOCAL_BUILD_SKIP_CLEANUP=1` y revisar los logs de Xcode en el directorio de trabajo indicado por EAS. |

Al redactar esta guía se revisaron los archivos y herramientas locales; no se ejecutó una nueva compilación ni se consultaron las cuentas remotas de Expo o Apple.
