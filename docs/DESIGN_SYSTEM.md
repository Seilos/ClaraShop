# Design System & UI Architecture — ClaraShop

Este documento define el **Sistema de Diseño y Guía de Componentes Reutilizables** para la plataforma ClaraShop. Establece los tokens de diseño, principios estéticos de Glassmorphism, auras ambientales animadas, jerarquía tipográfica y especificaciones de componentes.

---

## 1. Principios Visuales (Visual Language)

* **Estética Glassmorphism Esmerilado**: Uso de superficies vidriadas translúcidas con alto desenfoque (`backdrop-filter: blur(25px..30px)`), saturación aumentada (`saturate(180%..200%)`) y bordes luminosos sutiles.
* **Iluminación Dinámica (Ambient Auras)**: Orbes de luz en movimiento fluido detrás del plano de contenido que varían suavemente de tono (Azul Zafiro, Violeta Místico, Turquesa Nocturno e Índigo).
* **Contraste Extremo y Legibilidad Strict (100% WCAG AAA)**: El contenido textual sobre vidrio translúcido utiliza tonos pizarra profundos (`#0f172a`, `#1e293b`) o blancos puros con alto contraste.
* **Micro-interacciones e Inercia Apple-Style**: Transiciones y botones con curvas Bezier personalizadas (`cubic-bezier(0.16, 1, 0.3, 1)`) para dar sensación de suavidad e inercia.

---

## 2. Tokens de Diseño (CSS Tokens & Variables)

### A. Paleta de Colores

| Categoría | Nombre / Variable | Valor Hex / RGBA | Uso |
| :--- | :--- | :--- | :--- |
| **Fondo Base** | `--bg-deep-space` | `#0b0f19` | Fondo principal de pantalla completa |
| **Vidrio / Glass** | `--glass-surface-light` | `linear-gradient(145deg, rgba(255,255,255,0.86), rgba(235,243,255,0.78))` | Superficie de tarjetas Glassmorphism |
| **Borde Vidrio** | `--glass-border-light` | `1px solid rgba(255, 255, 255, 0.6)` | Borde nítido para tarjetas de cristal |
| **Sombra Vidrio** | `--glass-shadow` | `0 25px 60px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.85)` | Relieve y profundidad de tarjeta |
| **Texto Primario** | `--text-primary-dark` | `#0f172a` | Títulos principales e h3/h4 sobre tarjetas |
| **Texto Secundario** | `--text-secondary-dark` | `#1e293b` | Labels, subtítulos de sección y texto fuerte |
| **Texto Terciario** | `--text-tertiary-dark` | `#334155` | Descripciones, ayudas y placeholders |
| **Acento Marca** | `--accent-primary` | `#007aff` / `#4f46e5` | Botones primarios, enlaces e íconos principales |
| **Acento Secundario**| `--accent-purple` | `#a855f7` / `#7e22ce` | Botones secundarios y variantes outline |

---

## 3. Catálogo de Componentes Reutilizables

### A. Tarjeta Glassmorphism (`.glass-card`)

Contenedor principal para paneles, modales y formularios.

```jsx
<div
  style={{
    position: 'relative',
    overflow: 'hidden',
    padding: '32px 28px',
    borderRadius: '24px',
    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.86) 0%, rgba(235, 243, 255, 0.78) 100%)',
    backdropFilter: 'blur(30px) saturate(200%)',
    WebkitBackdropFilter: 'blur(30px) saturate(200%)',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
  }}
>
  {/* Contenido */}
</div>
```

---

### B. Variantes de Botones de Alta Gama

#### 1. Botón Primario Lujoso (`.btn-luxury-primary`)
Usado para la acción principal de una vista (ej: "Iniciar sesión", "Registrar tienda").

```jsx
<button type="submit" className="btn-luxury-primary">
  Iniciar sesión
</button>
```

#### 2. Botón Secundario (`.btn-luxury-secondary`)
Usado para acciones secundarias destacadas en bloque sólido.

```jsx
<button type="button" className="btn-luxury-secondary">
  Acción Secundaria
</button>
```

#### 3. Botón Outline Lujoso (`.btn-luxury-outline`)
Usado para alternar vistas o acciones de conversión secundarias sobre fondo glass.

```jsx
<button type="button" className="btn-luxury-outline">
  Crear nueva tienda
</button>
```

---

### C. Auras Ambientales Flotantes (`.aura-container`)

Animación de fondo en capa inferior para dar movimiento y elegancia.

```jsx
<div className="aura-container">
  <div className="aura-orb aura-orb-1" />
  <div className="aura-orb aura-orb-2" />
  <div className="aura-orb aura-orb-3" />
</div>
```

---

### D. Transiciones de Vista (`.animate-view-transition`)

Efecto de fundido y elevación al alternar entre formularios o pestañas.

```jsx
<div key={viewId} className="animate-view-transition">
  {/* Vista o Formulario actual */}
</div>
```

---

### E. Banner de Éxito Esmeralda Glass (`.glass-alert-success`)

Usado para confirmaciones y respuestas exitosas de operaciones (ej: creación de tienda, guardado de configuración).

```jsx
<div
  className="animate-view-transition"
  style={{
    padding: '12px 16px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(5, 150, 105, 0.22) 100%)',
    border: '1px solid rgba(16, 185, 129, 0.4)',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
    color: '#064e3b',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backdropFilter: 'blur(8px)',
  }}
>
  <ShieldCheck size={18} color="#059669" />
  <span>¡Operación realizada exitosamente!</span>
</div>
```

---

## 4. Convención de Estilos e Importación

* **Tokens CSS globales**: Ubicados en [`frontend/src/styles/tokens.css`](file:///c:/Users/I5/Documents/CODIGO/Tienda%20Duilio/frontend/src/styles/tokens.css).
* **Componentes UI base**: Almacenados en `frontend/src/components/ui/` (`Input.jsx`, `Select.jsx`, `Button.jsx`).
* **Regla de oro de Legibilidad**: Todo texto superpuesto a superficies de vidrio debe mantener una relación de contraste mínima de 4.5:1. Usar siempre `#0f172a` para encabezados y `#1e293b` para subtítulos.
