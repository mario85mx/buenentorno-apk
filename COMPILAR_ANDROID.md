# Compilación de Buen Entorno para Android

Para compilar la aplicación de Apple, consultar [Compilación para iOS](COMPILAR_IOS.md).

Este documento describe el proceso utilizado para generar en una Mac local una actualización Android de Buen Entorno y publicarla en Google Play Console.

> Para Google Play se genera un `.aab` con el perfil `production`. Para instalación directa se genera un `.apk` con `production-apk`; el procedimiento está en la sección «Generar e instalar un APK». Los comandos se ejecutan desde `apk/`.

## Configuración actual

| Dato | Valor |
| --- | --- |
| Paquete Android | `com.buenentorno.appmx` |
| Proyecto EAS | `a7d1fb21-7243-4504-831c-e7b9e9012897` |
| Versión configurada (26 de septiembre de 2026) | `1.0.4` |
| `versionCode` local | `3` |
| Rama | `main` |
| API de producción | `https://api.buenentorno.com` |
| Perfil para Google Play | `production` |

El siguiente `versionCode` debe ser mayor que cualquier código ya cargado en Google Play; no se debe deducir del valor local `3`. Como `eas.json` usa `appVersionSource: "remote"` y `autoIncrement: true`, EAS administra e incrementa ese número para cada build de producción.

## Requisitos de la máquina local

El build anterior se generó localmente con:

- macOS.
- Node.js 22.
- pnpm.
- Java/OpenJDK 17.
- Android SDK instalado en `$HOME/Library/Android/sdk`.
- EAS CLI y una sesión iniciada en la cuenta correcta de Expo.
- El keystore original de Buen Entorno disponible y respaldado.

Comprobar las herramientas:

```bash
node --version
pnpm --version
java -version
adb --version
npx eas-cli --version
```

## Elementos que nunca deben cambiarse o perderse

Para que Google Play acepte una actualización deben conservarse:

1. El paquete `com.buenentorno.appmx`.
2. La misma llave de carga usada en la versión publicada.
3. Un `versionCode` mayor que el de cualquier bundle subido anteriormente.

El keystore local actual se llama:

```text
@mario85mx__buenentorno-app.jks
```

Está ignorado por Git. Nunca debe subirse al repositorio, enviarse por chat ni guardarse dentro del `.aab`. Mantener una copia cifrada fuera de la computadora junto con sus contraseñas y alias.

## 1. Preparar el código

Desde la máquina local:

```bash
cd /Users/meriokids/Documents/85mx/BuenEntorno/buen-entorno/be/apk
git checkout main
git pull origin main
git status
pnpm install --frozen-lockfile
```

`git status` debe estar limpio antes de generar el artefacto definitivo. Los archivos `.aab`, `.apk`, `.jks` y `.env` no deben agregarse a Git.

## 2. Verificar la API de producción

La actualización de Documentos requiere que el API ya esté desplegado:

```bash
curl -i https://api.buenentorno.com/
curl -i https://api.buenentorno.com/documents
```

Resultados esperados:

- `/` responde `200 OK`.
- `/documents` sin token responde `401 Unauthorized`; esto confirma que la ruta existe y está protegida.

## 3. Probar la aplicación antes del build

Validar TypeScript:

```bash
pnpm exec tsc --noEmit
```

Levantar Expo limpiando la caché:

```bash
pnpm expo start --clear
```

Antes de publicar, probar al menos:

- Inicio de sesión.
- Cambio de condominio, si aplica.
- Avisos, encuestas, áreas comunes, tickets y accesos.
- Sección Documentos.
- Búsqueda de documentos.
- Apertura de PDF con el visor del dispositivo.
- Descarga/compartición de otros archivos.
- Modo claro y oscuro.
- Cierre y reapertura de la aplicación.

## 4. Actualizar la versión visible

Editar `app.json` e incrementar `expo.version`.

Ejemplo de versión visible; ajustar según la versión que se vaya a publicar:

```json
{
  "expo": {
    "version": "1.0.4"
  }
}
```

No cambiar `android.package`.

Consultar el `versionCode` que EAS tiene almacenado:

```bash
npx eas-cli build:version:get \
  --platform android \
  --profile production
```

El perfil `production` tiene `autoIncrement: true`; al iniciar el nuevo build, EAS generará un código superior. El valor de `android.versionCode` en `app.json` puede quedar desfasado porque la fuente configurada es remota.

Si el contador remoto está desfasado respecto a Google Play, consultar el último código utilizado y establecerlo en EAS antes de construir:

```bash
npx eas-cli build:version:set \
  --platform android \
  --profile production
```

`build:version:sync` descarga la versión remota al proyecto local; no corrige el contador remoto. No reinicializar versiones sin verificar primero el último código cargado en Google Play Console.

## 5. Verificar cuenta y credenciales de firma

Iniciar sesión y confirmar la cuenta Expo:

```bash
npx eas-cli login
npx eas-cli whoami
```

Revisar las credenciales Android:

```bash
npx eas-cli credentials --platform android
```

Debe seleccionarse el proyecto Buen Entorno y conservarse la credencial existente. **No generar ni reemplazar el keystore** durante una actualización normal.

Opcionalmente, comprobar el keystore local:

```bash
keytool -list -v -keystore ./@mario85mx__buenentorno-app.jks
```

El comando solicitará la contraseña. No escribir la contraseña directamente como argumento porque quedaría registrada en el historial.

## 6. Configurar Android SDK para el build local

Desde el SDK Manager de Android Studio, instalar las plataformas, Build-Tools y NDK que requiera el proyecto generado. La lista anterior describe el entorno del build histórico; si Gradle solicita otro JDK o componente para la versión actual de Expo / React Native, instalar la versión indicada por el error. EAS local usa las herramientas de esta máquina, no las versiones de una imagen de EAS Cloud.

En la terminal que generará el build:

```bash
export ANDROID_SDK_ROOT="$HOME/Library/Android/sdk"
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export PATH="$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$PATH"
```

Validar:

```bash
echo "$ANDROID_SDK_ROOT"
adb --version
```

## 7. Generar el Android App Bundle localmente

Generar el bundle en una carpeta de artefactos fuera del repositorio. Cambiar el nombre de salida si ya existe un archivo que se necesita conservar:

```bash
mkdir -p ../artifacts-android
npx eas-cli build \
  --platform android \
  --profile production \
  --local \
  --output ../artifacts-android/buen-entorno.aab
```

Notas importantes:

- Registrar el `versionCode` asignado por EAS, la versión visible y el commit (`git rev-parse HEAD`).
- Usar `--non-interactive` únicamente después de configurar y comprobar las credenciales.
- El build se ejecuta en la Mac, pero EAS CLI puede conectarse a Expo para consultar la versión y las credenciales.
- Ambos perfiles inyectan `EXPO_PUBLIC_API_URL=https://api.buenentorno.com` y `EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK=1`. Revisar también `.env` y el entorno: `EXPO_PUBLIC_API_URL_ANDROID` tiene prioridad en `src/services/api.ts` y no debe apuntar a una dirección local.
- No usar `production-apk` para Google Play.
- No cerrar la terminal ni suspender la computadora mientras compila.

Si no están exportadas globalmente las rutas del SDK, se puede usar el comando equivalente:

```bash
ANDROID_HOME="$HOME/Library/Android/sdk" \
ANDROID_SDK_ROOT="$HOME/Library/Android/sdk" \
npx eas-cli build \
  --platform android \
  --profile production \
  --local \
  --output ../artifacts-android/buen-entorno.aab
```

## 8. Verificar el bundle generado

```bash
ls -lh ../artifacts-android/buen-entorno.aab
jarsigner -verify -verbose -certs ../artifacts-android/buen-entorno.aab
```

La verificación debe terminar indicando que el archivo está firmado. Si Google Play informa que la firma no coincide, no intentes generar otra llave: revisa las credenciales de EAS y el keystore original.

Guardar el SHA-256 del artefacto:

```bash
shasum -a 256 ../artifacts-android/buen-entorno.aab
```

El `.aab` es un artefacto de publicación y está ignorado por Git.

## Generar e instalar un APK

Completar la preparación, configuración del SDK y revisión de firma anteriores. Este perfil ya define `android.buildType: "apk"` en `eas.json`:

```bash
mkdir -p ../artifacts-android
npx eas-cli build \
  --platform android \
  --profile production-apk \
  --local \
  --output ../artifacts-android/buen-entorno.apk
```

`production-apk` no tiene `autoIncrement: true` ni hereda el perfil `production`. Consultar su versión remota antes de construir si se necesita actualizar una instalación existente:

```bash
npx eas-cli build:version:get --platform android --profile production-apk
shasum -a 256 ../artifacts-android/buen-entorno.apk
```

Para revisar firma y metadatos, usar `apksigner` y `aapt` de la versión de Android SDK Build-Tools instalada. Sustituir `VERSION_INSTALADA` por el directorio disponible en `$ANDROID_HOME/build-tools`:

```bash
ls "$ANDROID_HOME/build-tools"
"$ANDROID_HOME/build-tools/VERSION_INSTALADA/apksigner" verify --verbose --print-certs ../artifacts-android/buen-entorno.apk
"$ANDROID_HOME/build-tools/VERSION_INSTALADA/aapt" dump badging ../artifacts-android/buen-entorno.apk
```

Confirmar paquete `com.buenentorno.appmx`, `versionName` y `versionCode`. Conectar un dispositivo con depuración USB habilitada y autorizar la Mac, o iniciar un emulador:

```bash
adb devices
adb install -r ../artifacts-android/buen-entorno.apk
```

Si hay varios dispositivos, usar `adb -s SERIAL install -r ...` con el serial mostrado. La actualización requiere una firma compatible y un código de versión aceptado por el dispositivo. Una instalación desde Google Play puede usar la llave de firma de Play, distinta de la llave de carga del APK local. Ante `INSTALL_FAILED_UPDATE_INCOMPATIBLE`, comprobar certificados y probar en otro dispositivo o emulador; desinstalar elimina los datos locales. No reemplazar el keystore para resolverlo.

Abrir la app y validar inicio de sesión, documentos, cámara/QR y funciones críticas contra producción. El APK de este perfil se ejecuta sin Metro. Un `.aab` no se instala directamente con `adb`; para probarlo usar un track de Google Play. Referencia: [APKs con EAS](https://docs.expo.dev/build-reference/apk/).

## Alternativa: compilar en EAS Cloud

Omitir `--local` y `--output`, conservando el perfil elegido:

```bash
npx eas-cli build --platform android --profile production
# O, para instalación directa:
npx eas-cli build --platform android --profile production-apk
```

Estos comandos envían el proyecto a EAS. Descargar el artefacto desde el enlace del build y aplicar las verificaciones correspondientes.

## 9. Subir la actualización a Google Play Console

1. Abrir [Google Play Console](https://play.google.com/console/).
2. Seleccionar **Buen Entorno**.
3. Entrar a **Prueba y lanzamiento > Producción**. Para validar primero con usuarios limitados, usar **Prueba interna**.
4. Seleccionar **Crear nueva versión**.
5. Subir `../artifacts-android/buen-entorno.aab`.
6. Esperar a que Google Play procese y valide el bundle.
7. Confirmar que muestra el paquete correcto y un código de versión mayor al publicado.
8. Escribir las notas de la versión.
9. Seleccionar **Siguiente** y resolver cualquier error obligatorio.
10. Guardar, revisar y enviar la actualización a revisión.
11. Si está habilitada la publicación administrada, publicar manualmente cuando la revisión sea aprobada.

Ejemplo de notas para esta actualización:

```text
<es-419>
Agregamos la nueva sección Documentos para consultar archivos del condominio, buscar por nombre y abrir documentos PDF desde el dispositivo. También incluimos mejoras de estabilidad y experiencia de uso.
</es-419>
```

## 10. Validar después de publicar

Cuando Google Play apruebe la actualización:

1. Instalar o actualizar desde el track donde se publicó.
2. Abrir la aplicación sin borrar la versión anterior, para comprobar una actualización real.
3. Confirmar inicio de sesión y persistencia de sesión.
4. Confirmar que Documentos aparece solo cuando el módulo está activo.
5. Abrir un PDF y descargar otro tipo de documento.
6. Revisar errores de Android Vitals y los comentarios del proceso de revisión.

## Problemas comunes

### Google Play dice que el código de versión ya fue usado

Cada `.aab` necesita un `versionCode` nuevo, incluso si el bundle anterior nunca llegó a producción. Consultar el valor remoto y generar un nuevo build; no se puede reutilizar el código rechazado por Google Play.

```bash
npx eas-cli build:version:get --platform android --profile production
```

### La firma no coincide

Se seleccionó una llave distinta a la usada en la publicación anterior. No crear otra llave. Revisar:

```bash
npx eas-cli credentials --platform android
keytool -list -v -keystore ./@mario85mx__buenentorno-app.jks
```

### No se encuentra Android SDK o `adb`

Volver a exportar `ANDROID_HOME`, `ANDROID_SDK_ROOT` y `PATH` como se indica en el paso 6.

### La aplicación intenta conectarse a localhost

Revisar el perfil y las variables `EXPO_PUBLIC_API_URL` y `EXPO_PUBLIC_API_URL_ANDROID`, incluidos los archivos `.env`. La variable específica de Android tiene prioridad. Corregir la URL y generar otro build.

### El build local falla

Revisar el primer error de Gradle, las versiones de Java y SDK, y las dependencias solicitadas. Para conservar el directorio de trabajo, repetir el comando anteponiendo `EAS_LOCAL_BUILD_SKIP_CLEANUP=1` y consultar la ruta indicada por EAS. Limpiar Metro no limpia el build nativo de Gradle; EAS local no ofrece el caché de EAS Cloud.

## Checklist rápido

- [ ] API de producción actualizada y funcionando.
- [ ] Código de `main` actualizado y `git status` limpio.
- [ ] Dependencias instaladas con lockfile.
- [ ] TypeScript sin errores.
- [ ] Funciones críticas probadas en un dispositivo.
- [ ] `expo.version` incrementada.
- [ ] `versionCode` remoto confirmado.
- [ ] Paquete Android sin cambios.
- [ ] Credencial de firma original confirmada.
- [ ] Build generado con `production --local`.
- [ ] `.aab` verificado y checksum guardado.
- [ ] Release creada en Google Play Console.
- [ ] Notas de versión agregadas.
- [ ] Actualización probada desde Google Play.

Al actualizar esta guía se revisó la configuración local; no se generó un nuevo build ni se consultaron las versiones remotas.

## Referencias oficiales

- [Builds locales con EAS](https://docs.expo.dev/build-reference/local-builds/)
- [Administración de versiones con EAS](https://docs.expo.dev/build-reference/app-versions/)
- [Preparar y publicar una versión en Google Play](https://support.google.com/googleplay/android-developer/answer/9859348?hl=es)
- [Requisitos para actualizar una aplicación](https://support.google.com/googleplay/android-developer/answer/9859350?hl=es)
