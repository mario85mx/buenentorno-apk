# Publicación de Buen Entorno en Google Play

Este documento describe el proceso utilizado para generar en una Mac local una actualización Android de Buen Entorno y publicarla en Google Play Console.

> Este flujo es para **Google Play (Android)**. El artefacto que se publica es un archivo `.aab`, no un `.apk`. El perfil `production-apk` existe únicamente para instalaciones manuales de prueba.

## Configuración actual

| Dato | Valor |
| --- | --- |
| Paquete Android | `com.buenentorno.appmx` |
| Proyecto EAS | `a7d1fb21-7243-4504-831c-e7b9e9012897` |
| Versión configurada | `1.0.2` |
| `versionCode` local | `3` |
| Rama | `main` |
| API de producción | `https://api.buenentorno.com` |
| Perfil para Google Play | `production` |

La siguiente actualización normalmente será `1.0.3`. Su `versionCode` deberá ser mayor que `3`. Como `eas.json` usa `appVersionSource: "remote"` y `autoIncrement: true`, EAS administra e incrementa ese número para cada build de producción.

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

Ejemplo para esta actualización:

```json
{
  "expo": {
    "version": "1.0.3"
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

Si alguna vez la versión remota no está sincronizada, detenerse y revisar antes de construir:

```bash
npx eas-cli build:version:sync \
  --platform android \
  --profile production
```

No cambiar la fuente remota ni reinicializar versiones sin verificar primero el último código publicado en Google Play Console.

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

El comando utilizado anteriormente fue `eas build` con `--local`. Para la versión de ejemplo `1.0.3`, usar:

```bash
npx eas-cli build \
  --platform android \
  --profile production \
  --local \
  --non-interactive \
  --output ./buen-entorno-1.0.3-vc4.aab
```

Notas importantes:

- Ajustar el nombre final si EAS asigna un `versionCode` distinto de `4`.
- El build se ejecuta en la Mac, pero EAS CLI puede conectarse a Expo para consultar la versión y las credenciales.
- El perfil `production` inyecta `EXPO_PUBLIC_API_URL=https://api.buenentorno.com`.
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
  --non-interactive \
  --output ./buen-entorno-1.0.3-vc4.aab
```

## 8. Verificar el bundle generado

```bash
ls -lh ./buen-entorno-1.0.3-vc4.aab
jarsigner -verify -verbose -certs ./buen-entorno-1.0.3-vc4.aab
```

La verificación debe terminar indicando que el archivo está firmado. Si Google Play informa que la firma no coincide, no intentes generar otra llave: revisa las credenciales de EAS y el keystore original.

Guardar el SHA-256 del artefacto:

```bash
shasum -a 256 ./buen-entorno-1.0.3-vc4.aab
```

El `.aab` es un artefacto de publicación y está ignorado por Git.

## 9. Subir la actualización a Google Play Console

1. Abrir [Google Play Console](https://play.google.com/console/).
2. Seleccionar **Buen Entorno**.
3. Entrar a **Prueba y lanzamiento > Producción**. Para validar primero con usuarios limitados, usar **Prueba interna**.
4. Seleccionar **Crear nueva versión**.
5. Subir `buen-entorno-1.0.3-vc4.aab`.
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

El build se generó con el perfil incorrecto. Para publicar debe usarse `--profile production`, cuya API es `https://api.buenentorno.com`.

### El build local falla por caché

Primero limpiar Expo y volver a validar:

```bash
pnpm expo start --clear
```

Si persiste, ejecutar nuevamente el build local conservando el mismo perfil y revisando el error original antes de borrar credenciales o regenerar archivos nativos.

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

## Referencias oficiales

- [Builds locales con EAS](https://docs.expo.dev/build-reference/local-builds/)
- [Administración de versiones con EAS](https://docs.expo.dev/build-reference/app-versions/)
- [Preparar y publicar una versión en Google Play](https://support.google.com/googleplay/android-developer/answer/9859348?hl=es)
- [Requisitos para actualizar una aplicación](https://support.google.com/googleplay/android-developer/answer/9859350?hl=es)
