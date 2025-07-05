# 🏢 Autoevaluación PYME - José Terrones

Aplicación web interactiva para que pequeñas y medianas empresas evalúen su nivel de preparación como proveedores de grandes corporaciones.

## 🚀 Características

- **Formulario de datos inicial**: RUC, Razón Social y contacto (validados)
- **8 preguntas estratégicas**: Evaluación tipo Sí/No
- **Sistema de calificación**: Alto (7-8), Medio (4-6), Bajo (0-3)
- **Interfaz responsiva**: Funciona en desktop y móvil
- **Diseño profesional**: Colores corporativos y UX limpia

## 🛠️ Tecnologías

- **React 18** con Hooks
- **Vite** para build y desarrollo
- **CSS puro** con diseño responsivo
- **Validaciones** de email, teléfono y RUC

## 📦 Instalación y Desarrollo

```bash
# Clonar repositorio
git clone [tu-repo-url]
cd autoevaluacion-pyme

# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 🌐 Deploy en Netlify

### Opción 1: Drag & Drop
1. Ejecutar `npm run build`
2. Ir a [netlify.com](https://netlify.com)
3. Arrastrar la carpeta `dist` al dashboard

### Opción 2: Git Integration
1. Subir código a GitHub
2. Conectar repositorio en Netlify
3. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

## 📊 Lógica de Evaluación

### Preguntas Evaluadas:
1. RUC activo y sin sanciones
2. Al menos 1 año de actividades
3. Personal en planilla +3 meses
4. Experiencia con cliente corporativo
5. Estados financieros auditados
6. Sistemas de gestión implementados
7. Responsable comercial/administrativo
8. Cumplimiento de plazos exigentes

### Niveles de Resultado:
- **🟢 ALTO (7-8 SÍ)**: Empresa preparada para grandes corporaciones
- **🟡 MEDIO (4-6 SÍ)**: Base sólida con áreas de mejora
- **🔴 BAJO (0-3 SÍ)**: Requiere fortalecimiento fundamental

## 👨‍💼 Autor

**José Terrones**  
Facilitador entre grandes empresas y proveedores confiables

## 📝 Licencia

Este proyecto es propiedad de José Terrones. Todos los derechos reservados.

---

### 🚀 Para comenzar el desarrollo:

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`