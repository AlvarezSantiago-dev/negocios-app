# Guía para el front (React) — Servidor Negocios App

Resumen breve

- Proyecto: Backend en Node/Express con renderizado Handlebars y API REST bajo `/api`.
- Objetivo: consumir la API desde un front en React (SPA) y/o integrar con las vistas actuales.

**Requisitos importantes**

- El servidor usa sesiones (`express-session` + `connect-mongo`). Las peticiones que dependan de sesión/usuario deben enviarse con credenciales (`credentials: 'include'` en `fetch`, o `withCredentials: true` en axios).
- Base API path: `http://localhost:PORT/api` (por defecto `PORT` viene de `env` o `args`, ver `package.json` scripts para puertos de ejemplo).
- CORS ya está habilitado en el backend pero debes incluir `credentials` en el cliente.

**Comandos útiles para el backend**

- Levantar en modo desarrollo (nodemon):

```powershell
npm run dev
```

- Levantar con persistencia FS/Memory (scripts útiles para pruebas locales):

```powershell
npm run fs
npm run memory
```

- Generar mocks de productos/usuarios (si existen scripts):

```powershell
npm run producto
npm run usuario
```

**Endpoints principales**

- Productos (bajo `/api/products`):

  - `GET /api/products` — listar todos los productos
  - `GET /api/products/paginate` — listar paginado (usa parámetros de query)
  - `GET /api/products/:_id` — obtener producto por id
  - `POST /api/products` — crear producto (Joi validation)
  - `PUT /api/products/:_id` — actualizar producto
  - `DELETE /api/products/:pid` — eliminar producto

- Compras (bajo `/api/compras`): (actualmente estructura similar a products)

  - `GET /api/compras`, `GET /api/compras/:_id`, `POST /api/compras`, `PUT /api/compras/:_id`, `DELETE /api/compras/:pid`, `GET /api/compras/paginate`

- Ventas (bajo `/api/ventas`):

  - `GET /api/ventas` — listar ventas
  - `GET /api/ventas/paginate` — paginado
  - `GET /api/ventas/:_id` — detalle
  - `POST /api/ventas` — crear venta
  - `PUT /api/ventas/:_id` — actualizar
  - `DELETE /api/ventas/:_id` — eliminar
  - Informes:
    - `GET /api/ventas/informes/diarias` — ventas diarias
    - `GET /api/ventas/informes/mensuales` — ventas mensuales
    - `GET /api/ventas/informes/ganancias` — ganancias

- Sesiones / usuarios (bajo `/api/sessions`):

  - `POST /api/sessions/register` — registrar usuario (Joi validation)
  - `POST /api/sessions/login` — iniciar sesión (devuelve sesión cookie)
  - `GET /api/sessions/online` — verificar usuario online (requiere sesión)
  - `POST /api/sessions/signout` — cerrar sesión
  - `GET /api/sessions/google` — inicio auth Google (redirect)
  - `GET /api/sessions/google/callback` — callback Google
  - `POST /api/sessions/forgot` — solicitar reseteo
  - `PUT /api/sessions/ressetpass` — resetear password
  - `POST /api/sessions/verify` — verificar (token/email)

- Otros endpoints útiles:
  - `POST /nodemailer` — endpoint en raíz que envía email (usado por util mailing)
  - Vistas server-side: rutas `GET /` renderizan Handlebars (`index`, `products`, `login`, `register`, `profile`, `users`, `cart`).

**Peticiones desde React: recomendaciones y ejemplos**

- Nota clave sobre sesión: el servidor establece una cookie de sesión. Para que el navegador la envíe en peticiones fetch desde un dominio/puerto distinto (ej: React dev server `localhost:3000` -> backend `localhost:8080`) debes:
  - En el `fetch` incluir `credentials: 'include'`.
  - Si usas axios, setear `axios.defaults.withCredentials = true;` o `{ withCredentials: true }` en cada request.
  - En producción, si sirves el build desde el mismo dominio, normalmente no hay problemas de cookies.

Ejemplos con `fetch`:

```javascript
// Obtener productos
fetch("http://localhost:8080/api/products", {
  method: "GET",
  credentials: "include",
})
  .then((r) => r.json())
  .then((data) => console.log(data));

// Login (form)
fetch("http://localhost:8080/api/sessions/login", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "user@example.com", password: "password" }),
})
  .then((r) => r.json())
  .then((data) => console.log(data));
```

Ejemplo con `axios`:

```javascript
import axios from "axios";
axios.defaults.withCredentials = true; // importante

// GET productos
axios
  .get("http://localhost:8080/api/products")
  .then((res) => console.log(res.data))
  .catch((err) => console.error(err));

// POST register
axios
  .post("http://localhost:8080/api/sessions/register", {
    name: "User",
    email: "u@x.com",
    password: "123456",
  })
  .then((r) => console.log(r.data))
  .catch((e) => console.error(e.response?.data || e.message));
```

**Estructura React sugerida (mínima)**

- `client/` (directorio recomendado para tu app React)
  - `src/`
    - `components/` — `Header.js`, `Footer.js`, `ProductCard.js`, `ProductList.js`, `LoginForm.js`, `RegisterForm.js`, `Cart.js`
    - `pages/` — `Home.jsx`, `Products.jsx`, `ProductDetail.jsx`, `Login.jsx`, `Profile.jsx`, `Checkout.jsx`
    - `hooks/` — `useAuth.js` (login, logout, check session), `useApi.js` (fetch wrapper que incluye credentials)
    - `services/` — `api.js` (axios instance), `products.service.js`, `sessions.service.js`
    - `App.jsx`, `index.jsx`

Sugerencias de implementación:

- Crear un `api.js` que exporte una instancia de axios con `baseURL` y `withCredentials` ya configurados:

```javascript
import axios from "axios";
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
});
export default api;
```

- `useAuth` hook: manejar estado `user`, `login`, `logout`, y `checkSession` que hace `GET /api/sessions/online`.
- Manejar errores del servidor mostrando mensajes de validación (Joi) que vienen en respuestas 4xx.

**Ejemplo rápido de componente (Products.jsx)**

```javascript
import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);
  return (
    <div>
      <h1>Productos</h1>
      <ul>
        {products.map((p) => (
          <li key={p._id}>
            {p.title} — ${p.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Consideraciones de seguridad/producción**

- Revisa configuración de cookies (`cookie: { maxAge, sameSite }`) si tu front y backend terminan en dominios distintos.
- En producción, sirve el build de React desde `public/` o configura un reverse proxy (NGINX) para que ambos estén en el mismo dominio y simplificar cookies.
- Maneja tokens CSRF si expones operaciones sensibles por POST con cookies.

**Verificación rápida de endpoints (curl / PowerShell)**

- Listar productos:

```powershell
curl http://localhost:8080/api/products
```

- Login (ejemplo, PowerShell):

```powershell
curl -Method POST -Uri http://localhost:8080/api/sessions/login -ContentType 'application/json' -Body '{"email":"u@x.com","password":"123456"}' -UseBasicParsing -Cookie ""
```

(Nota: `curl` en PowerShell se comporta distinto; recomiendo Postman o Insomnia para pruebas con cookies.)

**Siguientes pasos que puedo hacer por ti**

- Generar un scaffold React mínimo en `client/` con `create-react-app` o Vite y ejemplos de `ProductList` y `Login` conectados a la API.
- Crear `services/api.js` y los hooks `useAuth.js` y `useApi.js` dentro del repo.
- Implementar una página `Products` en `public/scripts` (si prefieres no usar React y usar Handlebars + JS).

---

Si quieres que genere el scaffold React (opción recomendada: Vite + React + Axios), dime: ¿prefieres `create-react-app` o `vite`? ¿Deseas que lo cree dentro del repo (`client/`) y añada dos componentes (`Products`, `Login`) ya conectados a la API?

---

## 🎉 ¡ACTUALIZACIÓN! Dashboard Completo Creado

Se ha generado un **Dashboard React** completo en `client/` con:

### ✅ Componentes Incluidos:

- **Dashboard.jsx** — Panel principal con KPIs, tablas de productos/ventas/compras, filtros interactivos
- **Informes.jsx** — Reportes de ventas diarias, mensuales y análisis de ganancias
- **Products.jsx** — Listado de productos
- **Ventas.jsx** — Histórico de ventas
- **Login.jsx** — Autenticación

### ✅ Características:

- 5 KPIs en tiempo real: Ventas Hoy, Ventas del Mes, Productos, Stock Bajo, Compras
- Filtros y búsqueda de productos por nombre y categoría
- Alertas de stock bajo (rojo si stock ≤ stockMinimo)
- Cálculo automático de márgenes por producto
- Tablas interactivas y responsive
- Informes con ventas diarias/mensuales y ganancias por producto
- Estilos CSS custom (sin necesidad de librerías externas)

### 📂 Estructura:

```
client/
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx     ⭐ Panel principal
│   │   ├── Informes.jsx      ⭐ Reportes
│   │   ├── Products.jsx
│   │   ├── Ventas.jsx
│   │   └── Login.jsx
│   ├── services/
│   │   └── api.js            (axios instance con credentials)
│   ├── styles/
│   │   ├── dashboard.css     ⭐ Estilos dashboard
│   │   ├── informes.css      ⭐ Estilos informes
│   │   └── index.css
│   └── main.jsx, App.jsx, etc.
└── package.json, index.html, vite.config.js
```

### 🚀 Cómo Arrancar:

```powershell
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd client
npm install
npm run dev
```

Luego abre `http://localhost:5173` (o el puerto que Vite indique).

### 📖 Más Detalles:

Lee `DASHBOARD_GUIDE.md` para documentación completa del Dashboard, arquitectura de datos, endpoints consumidos, y cómo extenderlo.
