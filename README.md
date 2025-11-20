# Nura – API de Especialistas en TCA (Backend)

**Alumnas:** Debbie Michanie, Chiara Rodo, Morena Castro y Tiara Albornos  
**Materia:** Aplicaciones Híbridas  
**Docente:** Jonathan Cruz  
**Comisión:** DWM4AP-0225

---

## 1. Descripción

API REST para gestionar especialistas en Trastornos de la Conducta Alimentaria (TCA) en Argentina.

Incluye:

- Autenticación con JWT y roles (`admin`, `client`).
- ABM de **Especialistas**.
- ABM de **Especialidades**.
- Validaciones con middlewares.
- Página legacy HTML en `/` que consume la API y muestra las cards de especialistas (misma estética Nura que el frontend).

---

## 2. Tecnologías principales

- **Runtime:** Node.js
- **Framework:** Express
- **Base de datos:** MongoDB + Mongoose
- **Auth:** JWT, `bcryptjs`
- **Arquitectura:** Controllers · Routes · Services · Middlewares · Models · Validators

Estructura simplificada:

```txt
api/
  controllers/
  middlewares/
  models/
  routes/
  services/
  utils/
  validators/
  public/         # index.html legacy + assets
  frontend/       # app React (frontend del panel)
  index.js        # entrypoint del servidor Express


**.env Backend:**
PORT=5000
URI_DB=mongodb+srv://apiDebbie:7654321@cluster0.yeqwjeg.mongodb.net/tca?retryWrites=true&w=majority&appName=Cluster0

CORS_ORIGIN=http://localhost:5173

CLIENT_EMAILS=cliente1@mail.com,cliente2@mail.com
CLIENT_PASSWORD=cliente123

# admin del ABM
ADMIN_EMAIL=admin@nura.app
ADMIN_PASSWORD=supersegura123
JWT_SECRET=un-secreto-bien-largo-y-unico
JWT_EXPIRES=7d

## 1. Cómo levantar el proyecto

### 1.1. Backend (API)
cd backend
npm install
npm run dev


La API se expone en:

http://localhost:5000/health → healthcheck

http://localhost:5000/api/auth

http://localhost:5000/api/especialidades

http://localhost:5000/api/especialistas

http://localhost:5000/ → página legacy con cards (usa la API)




##**.env Frontend:** 
VITE_API_URL=http://localhost:5000/api

## 1. Cómo levantar el proyecto

### 1.1. frontend 
cd frontend
npm install
npm run dev

http://localhost:5173
