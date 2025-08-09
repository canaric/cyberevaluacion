// Banco de preguntas para la evaluación de seguridad de la información
const questionBank = [
    {
        id: 1,
        category: "Conceptos Básicos",
        question: "¿Cuáles son los tres pilares fundamentales de la seguridad de la información?",
        options: [
            "Confidencialidad, Integridad y Disponibilidad",
            "Autenticación, Autorización y Auditoría",
            "Prevención, Detección y Respuesta",
            "Cifrado, Firewalls y Antivirus"
        ],
        correct: 0,
        explanation: "Los tres pilares fundamentales son la Confidencialidad (proteger la información de accesos no autorizados), Integridad (mantener la exactitud de los datos) y Disponibilidad (asegurar el acceso cuando se necesite)."
    },
    {
        id: 2,
        category: "Phishing",
        question: "¿Cuál de las siguientes es una señal típica de un correo de phishing?",
        options: [
            "Remitente conocido con saludo personalizado",
            "Solicitud urgente de información personal con amenazas",
            "Correo con archivos adjuntos esperados",
            "Mensaje sin enlaces externos"
        ],
        correct: 1,
        explanation: "Los correos de phishing suelen crear urgencia artificial y solicitar información personal amenazando con consecuencias negativas si no se actúa inmediatamente."
    },
    {
        id: 3,
        category: "Contraseñas",
        question: "¿Cuál es la característica MÁS importante de una contraseña segura?",
        options: [
            "Que contenga solo números",
            "Que sea fácil de recordar",
            "Que sea única para cada cuenta",
            "Que tenga exactamente 8 caracteres"
        ],
        correct: 2,
        explanation: "La característica más importante es que sea única para cada cuenta. Si una contraseña se compromete, no afectará otras cuentas."
    },
    {
        id: 4,
        category: "Ciberacoso",
        question: "¿Qué debe hacer una víctima de ciberacoso como PRIMERA acción?",
        options: [
            "Responder agresivamente al acosador",
            "Documentar y guardar evidencias del acoso",
            "Eliminar todas sus cuentas en redes sociales",
            "Ignorar completamente la situación"
        ],
        correct: 1,
        explanation: "Lo primero es documentar y guardar todas las evidencias (capturas de pantalla, mensajes) antes de que puedan ser eliminadas."
    },
    {
        id: 5,
        category: "Dispositivos Móviles",
        question: "¿Cuál es el mayor riesgo al conectarse a una red Wi-Fi pública?",
        options: [
            "Consumo excesivo de batería",
            "Velocidad de conexión lenta",
            "Interceptación de datos por terceros",
            "Costo adicional en la factura"
        ],
        correct: 2,
        explanation: "Las redes Wi-Fi públicas no cifradas permiten que atacantes intercepten el tráfico de datos, incluyendo información sensible."
    },
    {
        id: 6,
        category: "Ransomware",
        question: "¿Qué debe hacer si su computadora es infectada con ransomware?",
        options: [
            "Pagar inmediatamente el rescate solicitado",
            "Desconectar de la red y reportar el incidente",
            "Intentar descifrar los archivos manualmente",
            "Reiniciar la computadora repetidamente"
        ],
        correct: 1,
        explanation: "Debe desconectar inmediatamente el dispositivo de la red para evitar propagación y reportar el incidente. Nunca se debe pagar el rescate."
    },
    {
        id: 7,
        category: "Copias de Seguridad",
        question: "¿Con qué frecuencia se deben realizar copias de seguridad de datos importantes?",
        options: [
            "Una vez al año",
            "Solo cuando se recuerde",
            "Regularmente según la importancia de los datos",
            "Únicamente antes de vacaciones"
        ],
        correct: 2,
        explanation: "La frecuencia debe basarse en la importancia y frecuencia de cambio de los datos. Datos críticos pueden requerir copias diarias."
    },
    {
        id: 8,
        category: "Aulas Virtuales",
        question: "¿Qué medida de seguridad es esencial para videoconferencias educativas?",
        options: [
            "Permitir acceso libre sin restricciones",
            "Usar contraseñas y salas de espera",
            "Grabar todas las sesiones automáticamente",
            "Compartir el enlace en redes sociales"
        ],
        correct: 1,
        explanation: "Las contraseñas y salas de espera previenen intrusiones no deseadas (zoombombing) y mantienen la privacidad de la clase."
    },
    {
        id: 9,
        category: "Ingeniería Social",
        question: "¿Qué es la ingeniería social en el contexto de ciberseguridad?",
        options: [
            "Un tipo de software antivirus",
            "Manipulación psicológica para obtener información",
            "Una red social para profesionales",
            "Un protocolo de seguridad de red"
        ],
        correct: 1,
        explanation: "La ingeniería social es la manipulación psicológica de personas para que revelen información confidencial o realicen acciones que comprometan la seguridad."
    },
    {
        id: 10,
        category: "Autenticación",
        question: "¿Qué es la autenticación multifactor (MFA)?",
        options: [
            "Usar múltiples contraseñas diferentes",
            "Combinar algo que sabes, tienes y eres",
            "Cambiar contraseñas frecuentemente",
            "Usar solo biometría para acceder"
        ],
        correct: 1,
        explanation: "MFA combina múltiples factores: algo que sabes (contraseña), algo que tienes (teléfono/token) y algo que eres (biometría)."
    },
    {
        id: 11,
        category: "Malware",
        question: "¿Cuál es la diferencia principal entre un virus y un gusano?",
        options: [
            "Los virus son más peligrosos que los gusanos",
            "Los gusanos se propagan automáticamente, los virus necesitan un host",
            "Los virus solo afectan Windows, los gusanos afectan todos los sistemas",
            "No hay diferencia, son términos sinónimos"
        ],
        correct: 1,
        explanation: "Los gusanos se propagan automáticamente por la red, mientras que los virus necesitan infectar archivos host para propagarse."
    },
    {
        id: 12,
        category: "Privacidad",
        question: "¿Qué información NO debe compartirse en redes sociales por razones de seguridad?",
        options: [
            "Fotos de comida",
            "Ubicación en tiempo real y planes de viaje",
            "Opiniones sobre películas",
            "Fotos de mascotas"
        ],
        correct: 1,
        explanation: "Compartir ubicación en tiempo real y planes de viaje puede facilitar robos físicos y acoso, además de comprometer la seguridad personal."
    },
    {
        id: 13,
        category: "Actualizaciones",
        question: "¿Por qué es importante mantener el software actualizado?",
        options: [
            "Para tener las últimas funciones estéticas",
            "Para corregir vulnerabilidades de seguridad",
            "Para usar más espacio en disco",
            "Para hacer el sistema más lento"
        ],
        correct: 1,
        explanation: "Las actualizaciones incluyen parches de seguridad que corrigen vulnerabilidades que podrían ser explotadas por atacantes."
    },
    {
        id: 14,
        category: "Cifrado",
        question: "¿Cuándo es especialmente importante usar cifrado?",
        options: [
            "Solo al enviar correos electrónicos",
            "Al almacenar y transmitir datos sensibles",
            "Únicamente en dispositivos móviles",
            "Solo en redes corporativas"
        ],
        correct: 1,
        explanation: "El cifrado es crucial tanto para almacenar datos sensibles (cifrado en reposo) como para transmitirlos (cifrado en tránsito)."
    },
    {
        id: 15,
        category: "Incidentes",
        question: "¿Cuál es el primer paso al detectar un posible incidente de seguridad?",
        options: [
            "Intentar solucionarlo uno mismo",
            "Ignorarlo si parece menor",
            "Documentar y reportar inmediatamente",
            "Esperar a ver si empeora"
        ],
        correct: 2,
        explanation: "La respuesta rápida es crucial. Documentar y reportar inmediatamente permite una respuesta coordinada y efectiva."
    },
    {
        id: 16,
        category: "Navegación Segura",
        question: "¿Qué indica que un sitio web es seguro para transacciones?",
        options: [
            "Tiene muchos colores y animaciones",
            "La URL comienza con 'https://' y muestra un candado",
            "Aparece primero en los resultados de búsqueda",
            "Tiene muchas ventanas emergentes"
        ],
        correct: 1,
        explanation: "HTTPS (con 's' de secure) y el icono de candado indican que la conexión está cifrada y es más segura para transacciones."
    },
    {
        id: 17,
        category: "Gestión de Datos",
        question: "¿Qué principio debe seguirse al manejar datos personales?",
        options: [
            "Recopilar toda la información posible",
            "Compartir libremente con terceros",
            "Recopilar solo lo necesario y protegerlo adecuadamente",
            "Almacenar indefinidamente toda la información"
        ],
        correct: 2,
        explanation: "El principio de minimización de datos establece que solo se debe recopilar la información necesaria y protegerla adecuadamente."
    },
    {
        id: 18,
        category: "Amenazas Internas",
        question: "¿Qué caracteriza a una amenaza interna?",
        options: [
            "Siempre es maliciosa e intencional",
            "Proviene de personas con acceso legítimo al sistema",
            "Solo puede ser causada por hackers externos",
            "Es menos peligrosa que las amenazas externas"
        ],
        correct: 1,
        explanation: "Las amenazas internas provienen de empleados, contratistas o socios con acceso legítimo, y pueden ser maliciosas o accidentales."
    },
    {
        id: 19,
        category: "Políticas de Seguridad",
        question: "¿Por qué son importantes las políticas de seguridad en una organización?",
        options: [
            "Solo para cumplir con regulaciones",
            "Para establecer reglas claras y responsabilidades",
            "Para complicar el trabajo diario",
            "Solo para el departamento de IT"
        ],
        correct: 1,
        explanation: "Las políticas establecen reglas claras, definen responsabilidades y proporcionan un marco para la toma de decisiones de seguridad."
    },
    {
        id: 20,
        category: "Concientización",
        question: "¿Cuál es el factor más importante en la seguridad de la información?",
        options: [
            "La tecnología más avanzada",
            "El factor humano y la concientización",
            "Los firewalls más caros",
            "El software antivirus más reciente"
        ],
        correct: 1,
        explanation: "El factor humano es el más crítico. La tecnología es importante, pero las personas bien capacitadas son la primera línea de defensa."
    },
    {
        id: 21,
        category: "Respuesta a Incidentes",
        question: "¿Qué NO debe hacer durante un incidente de seguridad?",
        options: [
            "Documentar lo ocurrido",
            "Notificar al equipo de seguridad",
            "Intentar 'arreglar' el problema sin conocimiento",
            "Preservar evidencias"
        ],
        correct: 2,
        explanation: "Intentar arreglar sin conocimiento puede empeorar la situación o destruir evidencias importantes para la investigación."
    },
    {
        id: 22,
        category: "Cumplimiento",
        question: "¿Por qué es importante el cumplimiento normativo en seguridad?",
        options: [
            "Solo para evitar multas",
            "Para proteger datos y mantener confianza",
            "Para complicar los procesos",
            "Solo para empresas grandes"
        ],
        correct: 1,
        explanation: "El cumplimiento normativo protege los datos de las personas, mantiene la confianza y evita consecuencias legales y de reputación."
    },
    {
        id: 23,
        category: "Educación Continua",
        question: "¿Por qué es necesaria la educación continua en ciberseguridad?",
        options: [
            "Las amenazas evolucionan constantemente",
            "Solo para obtener certificaciones",
            "Para usar más tiempo de trabajo",
            "Solo para personal técnico"
        ],
        correct: 0,
        explanation: "Las amenazas cibernéticas evolucionan constantemente, por lo que la educación debe ser continua para mantenerse actualizado."
    },
    {
        id: 24,
        category: "Trabajo Remoto",
        question: "¿Qué precaución adicional debe tomarse al trabajar remotamente?",
        options: [
            "Usar solo dispositivos personales",
            "Conectarse a cualquier red disponible",
            "Asegurar el entorno de trabajo y usar VPN",
            "Compartir credenciales con familiares"
        ],
        correct: 2,
        explanation: "El trabajo remoto requiere asegurar el entorno físico, usar conexiones seguras (VPN) y mantener la confidencialidad."
    },
    {
        id: 25,
        category: "Cultura de Seguridad",
        question: "¿Qué significa tener una cultura de seguridad en una organización?",
        options: [
            "Solo el departamento de IT se preocupa por la seguridad",
            "Todos los miembros asumen responsabilidad por la seguridad",
            "Se implementan muchas herramientas tecnológicas",
            "Se realizan auditorías frecuentes"
        ],
        correct: 1,
        explanation: "Una cultura de seguridad significa que todos los miembros de la organización entienden y asumen su responsabilidad en la protección de la información."
    }
];

// Función para obtener preguntas aleatorias
function getRandomQuestions(count = 25) {
    const shuffled = [...questionBank].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}
