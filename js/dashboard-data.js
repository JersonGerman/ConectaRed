/* ==========================================================================
   CONECTARED - ARCHIVO CENTRAL DE SIMULACIÓN DE DATOS (MOCK DATA)
   ========================================================================== */

/**
 * CONTROL DE ACCESO DINÁMICO:
 * Asigne "STUDENT" para visualizar la interfaz del discente.
 * Asigne "VOLUNTEER" para desplegar el panel de control del mentor.
 */
const CURRENT_USER_ROLE = "VOLUNTEER";

/* ==========================================================================
   SECCIÓN 1: ESTRUCTURAS DE DATOS PARA EL ROL DE ESTUDIANTE (STUDENT)
   ========================================================================== */

// A. Información de la Próxima Sesión de Mentoría
const UPCOMING_SESSION = {
  mentorName: "Dr. Sarah Mitchell",
  specialty: "Advanced UI/UX Design Principles",
  date: "March 12, 2026",
  time: "10:30 AM - 11:30 AM",
  avatar: "assets/images/mentors/sarah.jpg",
  status: "UPCOMING",
};

// B. Métricas de Progreso Analítico (Gráficos Circulares)
const PROGRESS_METRICS = [
  { label: "Active Course", percentage: 75, color: "#f6e05e" }, // Amarillo
  { label: "Resources", percentage: 40, color: "#4a5568" }, // Gris oscuro
  { label: "Assignments", percentage: 90, color: "#a0aec0" }, // Gris claro
];

// C. Tarjetas de Recomendación Personalizadas
const RECOMMENDED_COURSES = [
  {
    id: 1,
    category: "DESIGN",
    tagClass: "tag-design",
    title: "Mastering Modern Typography",
    duration: "45 mins",
    image: "assets/images/courses/typography.jpg",
  },
  {
    id: 2,
    category: "BUSINESS",
    tagClass: "tag-business",
    title: "Agile Product Lifecycle",
    duration: "1h 20m",
    image: "assets/images/courses/agile.jpg",
  },
  {
    id: 3,
    category: "ARTS",
    tagClass: "tag-arts",
    title: "Psychology of Color in Tech",
    duration: "30 mins",
    image: "assets/images/courses/color.jpg",
  },
];

// D. Bitácora Cronológica de Actividades Recientes
const RECENT_ACTIVITIES = [
  {
    id: 1,
    type: "completed",
    icon: "✓",
    text: 'Completed "UI Foundations"',
    timeAgo: "2 days ago",
  },
  {
    id: 2,
    type: "scheduled",
    icon: "📅",
    text: "Scheduled session with Dr. Mitchell",
    timeAgo: "Yesterday",
  },
  {
    id: 3,
    type: "saved",
    icon: "🔖",
    text: 'Saved "Design Thinking Guide"',
    timeAgo: "2 days ago",
  },
  {
    id: 4,
    type: "followed",
    icon: "👤",
    text: "Followed Marcus Aurelius",
    timeAgo: "3 days ago",
  },
];

/* ==========================================================================
   SECCIÓN 2: ESTRUCTURAS DE DATOS PARA EL ROL DE VOLUNTARIO (VOLUNTEER)
   ========================================================================== */

// E. Métricas de Impacto Social y Gestión del Voluntariado
const VOLUNTEER_DATA = {
  stats: [
    {
      title: "Estudiantes ayudados",
      value: "47",
      detail: "+3 este mes",
      class: "stat-students",
    },
    {
      title: "Horas de mentoría",
      value: "128",
      detail: "Meta: 150h para cert.",
      class: "stat-hours",
    },
    {
      title: "Materiales donados",
      value: "23",
      detail: "12 libros | 11 PDFs",
      class: "stat-materials",
    },
    {
      title: "Calificación",
      value: "4.9",
      detail: "89 reseñas",
      class: "stat-rating",
    },
  ],
  sessions: [
    {
      student: "Diego Morales",
      time: "3 PM",
      subject: "Álgebra Lineal",
      status: "Confirmada",
      statusClass: "status-confirmed",
    },
    {
      student: "Lucia Vargas",
      time: "6 PM",
      subject: "Cálculo I",
      status: "Confirmada",
      statusClass: "status-confirmed",
    },
    {
      student: "Rodrigo Castro",
      time: "Mañana 4 PM",
      subject: "C++",
      status: "Pendiente",
      statusClass: "status-pending",
    },
  ],
};
