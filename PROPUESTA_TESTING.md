# 🧪 PROPUESTA: Implementación de Testing

## 📊 ESTADO ACTUAL

**❌ NO hay testing implementado**

- Sin tests unitarios
- Sin tests de integración
- Sin tests E2E
- Sin configuración de testing

---

## 🎯 PROPUESTA DE TESTING

### Niveles de Testing Recomendados

```
┌─────────────────────────────────────┐
│  E2E Tests (Playwright)             │  ← Flujos completos de usuario
│  - Login y navegación               │
│  - Carga de horas                   │
│  - Generación de reportes           │
└─────────────────────────────────────┘
           ↑
┌─────────────────────────────────────┐
│  Integration Tests (Vitest)         │  ← Interacción entre componentes
│  - API calls                        │
│  - Hooks con contexto               │
│  - Offline sync                     │
└─────────────────────────────────────┘
           ↑
┌─────────────────────────────────────┐
│  Unit Tests (Vitest)                │  ← Funciones individuales
│  - Utilidades                       │
│  - Helpers                          │
│  - Validaciones                     │
└─────────────────────────────────────┘
```

---

## 🛠️ STACK RECOMENDADO

### Frontend

**Framework:** Vitest + React Testing Library
- ✅ Integración nativa con Vite
- ✅ Compatible con ES Modules
- ✅ Rápido y moderno
- ✅ API similar a Jest

**E2E:** Playwright
- ✅ Multi-browser (Chrome, Firefox, Safari)
- ✅ Soporte móvil
- ✅ Screenshots y videos
- ✅ Debugging visual

### Backend

**Framework:** Vitest (o Jest)
- ✅ Tests de rutas
- ✅ Tests de middleware
- ✅ Tests de validaciones
- ✅ Mocking de Supabase

---

## 📦 INSTALACIÓN

### Frontend

```bash
cd frontend

# Vitest + React Testing Library
npm install -D vitest @vitest/ui
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event
npm install -D jsdom

# Playwright (E2E)
npm install -D @playwright/test
npx playwright install
```

### Backend

```bash
cd backend

# Vitest
npm install -D vitest
npm install -D supertest  # Para tests de API
```

---

## ⚙️ CONFIGURACIÓN

### Frontend - vitest.config.js

```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.test.{js,jsx}',
        '**/*.spec.{js,jsx}'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### Frontend - src/tests/setup.js

```javascript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;
```

### Frontend - package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 📝 EJEMPLOS DE TESTS

### 1. Unit Test - Utilidades

**Archivo:** `src/utils/__tests__/dateHelpers.test.js`

```javascript
import { describe, it, expect } from 'vitest';
import { calculateHours, safeDate, formatDate } from '../dateHelpers';

describe('dateHelpers', () => {
  describe('calculateHours', () => {
    it('calcula horas correctamente', () => {
      const start = '2026-03-28T08:00:00';
      const end = '2026-03-28T16:00:00';
      
      const hours = calculateHours(start, end);
      
      expect(hours).toBe(8);
    });

    it('maneja horas con decimales', () => {
      const start = '2026-03-28T08:00:00';
      const end = '2026-03-28T12:30:00';
      
      const hours = calculateHours(start, end);
      
      expect(hours).toBe(4.5);
    });

    it('retorna 0 para fechas inválidas', () => {
      const hours = calculateHours('invalid', 'invalid');
      
      expect(hours).toBe(0);
    });
  });

  describe('safeDate', () => {
    it('convierte string a Date', () => {
      const date = safeDate('2026-03-28');
      
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2026);
    });

    it('retorna fecha actual para input inválido', () => {
      const date = safeDate('invalid');
      
      expect(date).toBeInstanceOf(Date);
    });
  });
});
```

---

### 2. Component Test - Button

**Archivo:** `src/components/common/__tests__/Button.test.jsx`

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  it('renderiza correctamente', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('llama onClick cuando se hace click', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('está deshabilitado cuando loading es true', () => {
    render(<Button loading>Click me</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('aplica variant correctamente', () => {
    render(<Button variant="danger">Delete</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-600');
  });
});
```

---

### 3. Hook Test - useTimeEntries

**Archivo:** `src/hooks/__tests__/useTimeEntries.test.js`

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTimeEntries } from '../useTimeEntries';
import { timeEntriesService } from '../../services/api';

// Mock del servicio
vi.mock('../../services/api', () => ({
  timeEntriesService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('useTimeEntries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carga entries al montar', async () => {
    const mockEntries = [
      { id: '1', description: 'Test 1' },
      { id: '2', description: 'Test 2' }
    ];
    
    timeEntriesService.getAll.mockResolvedValue({
      timeEntries: mockEntries
    });

    const { result } = renderHook(() => useTimeEntries('user-123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.timeEntries).toHaveLength(2);
    expect(timeEntriesService.getAll).toHaveBeenCalledTimes(1);
  });

  it('crea entry correctamente', async () => {
    const newEntry = { id: '3', description: 'New entry' };
    
    timeEntriesService.create.mockResolvedValue({
      timeEntry: newEntry
    });

    const { result } = renderHook(() => useTimeEntries('user-123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const response = await result.current.createEntry({
      description: 'New entry'
    });

    expect(response.success).toBe(true);
    expect(response.data).toEqual(newEntry);
  });
});
```

---

### 4. Integration Test - Login Flow

**Archivo:** `src/tests/integration/login.test.jsx`

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/Login';
import { authService } from '../../services/api';

vi.mock('../../services/api');

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Login Flow', () => {
  it('login exitoso redirige al dashboard', async () => {
    authService.login.mockResolvedValue({
      user: { id: '1', username: 'test' },
      token: 'fake-token'
    });

    renderWithRouter(<Login />);

    // Llenar formulario
    fireEvent.change(screen.getByLabelText(/usuario/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'password123' }
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // Verificar llamada al servicio
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
    });
  });

  it('muestra error en login fallido', async () => {
    authService.login.mockRejectedValue(new Error('Credenciales inválidas'));

    renderWithRouter(<Login />);

    fireEvent.change(screen.getByLabelText(/usuario/i), {
      target: { value: 'wrong' }
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'wrong' }
    });

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
    });
  });
});
```

---

### 5. E2E Test - Playwright

**Archivo:** `tests/e2e/timeEntries.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Time Entries', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:5173/login');
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('puede cargar horas', async ({ page }) => {
    // Ir a registros
    await page.click('text=Registros de Tiempo');
    await page.waitForURL('**/time-entries');

    // Abrir modal de carga
    await page.click('text=Cargar Horas');

    // Llenar formulario
    await page.fill('[name="date"]', '2026-03-28');
    await page.selectOption('[name="unit"]', { label: 'Empaque' });
    await page.fill('[name="hours"]', '8');

    // Guardar
    await page.click('button:has-text("Guardar")');

    // Verificar éxito
    await expect(page.locator('text=registros creados')).toBeVisible();
  });

  test('puede ver historial', async ({ page }) => {
    await page.goto('http://localhost:5173/time-entries');

    // Verificar que hay registros
    await expect(page.locator('[data-testid="entry-list"]')).toBeVisible();
    
    // Verificar que muestra horas
    await expect(page.locator('text=/\\d+\\.?\\d*h/')).toBeVisible();
  });

  test('puede generar reporte', async ({ page }) => {
    await page.goto('http://localhost:5173/reports');

    // Seleccionar rango de fechas
    await page.fill('[name="startDate"]', '2026-03-01');
    await page.fill('[name="endDate"]', '2026-03-31');

    // Generar reporte
    await page.click('button:has-text("Generar")');

    // Verificar que muestra datos
    await expect(page.locator('[data-testid="report-summary"]')).toBeVisible();
  });
});
```

---

### 6. Backend Test - API Routes

**Archivo:** `backend/src/routes/__tests__/auth.test.js`

```javascript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

describe('Auth Routes', () => {
  describe('POST /api/auth/login', () => {
    it('login exitoso retorna token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('login fallido retorna 401', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'wrong',
          password: 'wrong'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('valida campos requeridos', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('retorna usuario autenticado', async () => {
      // Primero hacer login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      const token = loginRes.body.token;

      // Luego obtener perfil
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('username');
    });

    it('retorna 401 sin token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });
  });
});
```

---

## 📊 COBERTURA RECOMENDADA

### Prioridad Alta (Crítico)

**Backend:**
- ✅ Autenticación y autorización
- ✅ Validaciones de entrada
- ✅ Lógica de permisos por rol
- ✅ Creación/actualización de time entries

**Frontend:**
- ✅ Login/logout
- ✅ Carga de horas (online y offline)
- ✅ Sincronización offline
- ✅ Validaciones de formularios

### Prioridad Media

**Backend:**
- ✅ Reportes
- ✅ Gestión de usuarios
- ✅ Estructura organizacional

**Frontend:**
- ✅ Navegación entre páginas
- ✅ Generación de reportes
- ✅ Exportación de datos

### Prioridad Baja

- Componentes visuales simples
- Utilidades de formato
- Helpers de fecha

---

## 🎯 PLAN DE IMPLEMENTACIÓN

### Fase 1: Setup (1-2 días)
- [ ] Instalar dependencias
- [ ] Configurar Vitest
- [ ] Configurar Playwright
- [ ] Crear archivos de setup
- [ ] Agregar scripts a package.json

### Fase 2: Tests Críticos (3-5 días)
- [ ] Tests de autenticación (backend)
- [ ] Tests de time entries (backend)
- [ ] Tests de validaciones (backend)
- [ ] Tests de login (frontend)
- [ ] Tests de carga de horas (frontend)

### Fase 3: Tests de Integración (2-3 días)
- [ ] Flujo completo de login
- [ ] Flujo de carga offline
- [ ] Flujo de sincronización
- [ ] Flujo de reportes

### Fase 4: E2E Tests (2-3 días)
- [ ] Login y navegación
- [ ] Carga de horas
- [ ] Generación de reportes
- [ ] Gestión de usuarios (admin)

### Fase 5: Cobertura Adicional (ongoing)
- [ ] Tests de componentes
- [ ] Tests de hooks
- [ ] Tests de utilidades
- [ ] Mejorar cobertura general

---

## 🚀 COMANDOS

```bash
# Frontend
npm run test                 # Ejecutar tests en watch mode
npm run test:ui              # UI interactiva de Vitest
npm run test:coverage        # Generar reporte de cobertura
npm run test:e2e             # Ejecutar tests E2E
npm run test:e2e:ui          # UI interactiva de Playwright

# Backend
npm run test                 # Ejecutar tests
npm run test:watch           # Watch mode
npm run test:coverage        # Cobertura
```

---

## 📈 MÉTRICAS DE ÉXITO

### Cobertura Objetivo
- **Backend:** > 80%
- **Frontend (lógica):** > 70%
- **Frontend (UI):** > 50%

### Tests Mínimos
- **Backend:** 50+ tests
- **Frontend:** 100+ tests
- **E2E:** 20+ scenarios

---

## 💰 BENEFICIOS

### Corto Plazo
- ✅ Detectar bugs antes de producción
- ✅ Refactoring seguro
- ✅ Documentación viva del código

### Largo Plazo
- ✅ Menos bugs en producción
- ✅ Desarrollo más rápido
- ✅ Confianza en cambios
- ✅ Onboarding más fácil

---

## 📝 RESUMEN

**Estado Actual:**
- ❌ Sin testing implementado
- ❌ Sin configuración
- ❌ Sin cobertura

**Propuesta:**
- ✅ Vitest para unit/integration tests
- ✅ Playwright para E2E tests
- ✅ Cobertura > 70% en lógica crítica
- ✅ Implementación por fases

**Tiempo Estimado:**
- Setup: 1-2 días
- Tests críticos: 3-5 días
- Tests completos: 2-3 semanas

---

**Fecha:** 28 de marzo de 2026  
**Prioridad:** MEDIA-ALTA  
**Estado:** 📋 Propuesta pendiente de aprobación
