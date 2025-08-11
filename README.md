# Barbería Q2N

Aplicación React para gestión de turnos que utiliza Firebase para la autenticación y la base de datos. Incluye funciones en Cloud Functions para tareas programadas y se puede publicar en GitHub Pages.

## Funcionalidades destacadas

- Gestión de profesionales y servicios
- Horarios con múltiples bloques diarios
- Copia rápida de horarios de un día a otros con selector de días desde la pantalla de administración

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior.
- [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`).

## Instalación de dependencias

En la raíz del proyecto instala las dependencias del cliente:

```bash
npm install
```

Para las funciones de Firebase ejecuta:

```bash
cd functions && npm install && cd ..
```

## Configuración de variables de entorno

Crea un archivo `.env` en la raíz con tus valores de Firebase:

```dotenv
VITE_FIREBASE_API_KEY=XXXX
VITE_FIREBASE_AUTH_DOMAIN=XXXX
VITE_FIREBASE_PROJECT_ID=XXXX
VITE_FIREBASE_STORAGE_BUCKET=XXXX
VITE_FIREBASE_MESSAGING_SENDER_ID=XXXX
VITE_FIREBASE_APP_ID=XXXX
```

### Configuración de clientes (tenants)

Crea una colección `tenants` en Firestore donde cada documento represente un cliente. El ID del documento será el _slug_ utilizado en la URL y debe incluir al menos los campos `companyId` y `projectName`:

```text
tenants/
  barberia1 { companyId: "c1", projectName: "Barbería 1" }
  barberia2 { companyId: "c2", projectName: "Barbería 2" }
```

Al acceder a `agendarturnos.ar/{cliente}` la aplicación cargará estos datos y los usará para filtrar la información.

Si usas las funciones de envío de correos configura SendGrid:

```bash
firebase functions:config:set sendgrid.key="TU_SENDGRID_API_KEY"
```

Para habilitar la integración con Mercado Pago agrega tu token de acceso:

```bash
firebase functions:config:set mercadopago.token="TU_ACCESS_TOKEN"
```

Y define las URLs de pago que se mostrarán en el formulario de alta para
cada plan:

```bash
echo "VITE_MP_STANDARD_LINK=LINK_STANDARD"   > .env
echo "VITE_MP_AVANZADO_LINK=LINK_AVANZADO" >> .env
echo "VITE_MP_ILIMITADO_LINK=LINK_ILIMITADO" >> .env
# Enlace de pago genérico opcional
echo "VITE_MERCADOPAGO_LINK=LINK_POR_DEFECTO" >> .env
```

El formulario de alta para nuevos tenants solicitará además del `slug` un `companyId` (identificador de la empresa),
el nombre del proyecto, un email y una contraseña.

## Entorno de desarrollo

Inicia Vite con:

```bash
npm start
```

El servidor quedará disponible normalmente en `http://localhost:5173`.

## Despliegue

### GitHub Pages

Ejecuta:

```bash
npm run deploy
```

Se compilará la aplicación y se publicará el contenido de `dist/` en la rama `gh-pages`.

### Firebase

Para desplegar las Cloud Functions (y Hosting si lo configuras) usa:

```bash
firebase deploy
```
