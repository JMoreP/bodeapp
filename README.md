<div align="center">
  <h1>📦 BodeApp</h1>
  <p><strong>Sistema de Punto de Venta (POS) y Gestión Multi-Tenant (SaaS)</strong></p>
</div>

---

> 🚧 **ESTADO DEL PROYECTO: EN CONSTRUCCIÓN** 🚧
>
> Este proyecto se encuentra actualmente en fase de desarrollo activo. Algunas funcionalidades pueden estar incompletas, sujetas a cambios bruscos o en proceso de prueba.

## 📝 Sobre el Proyecto

**BodeApp** (calcbo) es una aplicación moderna orientada a la gestión de negocios y puntos de venta (POS) bajo una arquitectura SaaS (Software as a Service) multi-tenant. 

El sistema permite la administración de inventarios, calculadoras de productos, y cuenta con distintos roles de usuario, incluyendo un panel de **Super Admin** para la gestión global de inquilinos (tenants) y un **Dashboard** para las operaciones del día a día del POS.

## 🚀 Tecnologías Principales

- **Frontend:** React 19, TypeScript, Vite
- **Estilos:** Tailwind CSS (con soporte para modo claro/oscuro y diseño moderno)
- **Backend / Base de Datos:** Firebase (Auth, Firestore)
- **Iconografía:** Lucide React

## 💻 Instalación y Uso Local

Sigue estos pasos para correr el entorno de desarrollo en tu máquina local:

### Prerrequisitos
- Node.js (v18+)
- Cuenta de Firebase configurada

### Configuración

1. **Clonar e instalar dependencias:**
   ```bash
   npm install
   ```

2. **Variables de Entorno:**
   Crea un archivo `.env` en la raíz del proyecto usando como base el archivo `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *Rellena el archivo `.env` con las credenciales de tu proyecto de Firebase.*

3. **Correr la aplicación:**
   ```bash
   npm run dev
   ```

La aplicación estará disponible localmente, usualmente en `http://localhost:5173`.

---
*Desarrollado para la optimización de procesos de venta y gestión.*
