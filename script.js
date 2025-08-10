// Variables globales
const currentQuestions = [];
let currentQuestionIndex = 0;
const userAnswers = [];
let examStartTime = null;
let timerInterval = null;
const timeLimit = 45 * 60; // 45 minutos en segundos
let timeRemaining = timeLimit;

// Elementos del DOM
const welcomeSection = document.getElementById("welcomeSection");
const examSection = document.getElementById("examSection");
const resultsSection = document.getElementById("resultsSection");
const reviewSection = document.getElementById("reviewSection");
const startExamBtn = document.getElementById("startExam");
const questionContainer = document.getElementById("questionContainer");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const timerElement = document.getElementById("timer");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const backToResultsBtn = document.getElementById("backToResults");

// Event listeners
document.addEventListener("DOMContentLoaded", function() {
        // Función para manejar el clic en el botón de inicio
        function onClick(e) {
            e.preventDefault();  // Evita que el botón haga su acción por defecto
            grecaptcha.enterprise.ready(async () => {
                // Ejecuta el reCAPTCHA y obtiene el token
                const token = await grecaptcha.enterprise.execute('6LeZs58rAAAAAEpSjc9w-iyenjJiTMlTQK6ALB3-', {action: 'LOGIN'});
                
                // Aquí puedes enviar el token al servidor para validarlo
                sessionStorage.setItem('recaptchaToken', token);
                
                // Luego de obtener el token, puedes proceder a iniciar el examen
                iniciarExamen();  // Llama a la función para comenzar el examen
            });
        }
        
        // Asegúrate de asociar la función al evento de clic en el botón
        document.getElementById("startExam").addEventListener("click", onClick);
    
    startExamBtn.addEventListener("click", iniciarExamen);
    prevBtn.addEventListener("click", previousQuestion);
    nextBtn.addEventListener("click", nextQuestion);
    submitBtn.addEventListener("click", submitExam);
    
    // Event listeners para los botones de resultados
    document.getElementById("reviewBtn").addEventListener("click", reviewAnswers);
    document.getElementById("retryBtn").addEventListener("click", retryExam);
    document.getElementById("certificateBtn").addEventListener("click", downloadCertificate);
    backToResultsBtn.addEventListener("click", () => {
        reviewSection.style.display = "none";
        resultsSection.style.display = "block";
    });
});

function iniciarExamen() {
    // Validar información del usuario
    const rawName = document.getElementById("studentName").value.trim();
    const id = document.getElementById("studentId").value.trim();
    const userType = document.getElementById("userType").value;

    // Validación de nombre: solo letras (incluye acentos y ñ) y espacios
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(rawName)) {
        alert("El nombre solo debe contener letras y espacios.");
        return;
    }

    // Formateo: Primera letra en mayúscula para cada palabra
    const formattedName = rawName
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    // Validación de DNI: NN.NNN.NNN
    if (!/^\d{2}\.\d{3}\.\d{3}$/.test(id)) {
        alert("El DNI debe estar en el formato NN.NNN.NNN (solo números y puntos).");
        return;
    }

    // Validación de tipo de usuario
    if (!userType) {
        alert("Por favor, seleccione el tipo de usuario.");
        return;
    }

    // Guardar información del usuario ya formateada
    sessionStorage.setItem("userName", formattedName);
    sessionStorage.setItem("userId", id);
    sessionStorage.setItem("userType", userType);

    // Obtener preguntas aleatorias
    currentQuestions.length = 0;
    currentQuestions.push(...getRandomQuestions(25));
    userAnswers.length = 0;
    userAnswers.push(...new Array(currentQuestions.length).fill(null));

    // Mostrar sección de preguntas
    document.getElementById("formSection").style.display = "none";
    document.getElementById("questionSection").style.display = "block";
    showQuestion(0);
}

function displayQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    
    questionContainer.innerHTML = `
        <div class="question">
            <div class="question-header">
                <span class="question-number">Pregunta ${currentQuestionIndex + 1}</span>
                <span class="question-category">${question.category}</span>
            </div>
            <div class="question-text">${question.question}</div>
            <div class="options">
                ${question.options.map((option, index) => `
                    <label class="option ${userAnswers[currentQuestionIndex] === index ? "selected" : ""}" 
                           onclick="selectOption(${index})">
                        <input type="radio" name="question${currentQuestionIndex}" value="${index}" 
                               ${userAnswers[currentQuestionIndex] === index ? "checked" : ""}>
                        <span class="option-text">${option}</span>
                    </label>
                `).join("")}
            </div>
        </div>
    `;
    
    updateNavigationButtons();
}

function selectOption(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;
    
    // Actualizar visualmente la selección
    const options = document.querySelectorAll(".option");
    options.forEach((option, index) => {
        option.classList.toggle("selected", index === optionIndex);
    });
    
    // Guardar progreso
    saveProgress();
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
        updateProgress();
    }
}

function nextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
        updateProgress();
    }
}

function updateNavigationButtons() {
    prevBtn.disabled = currentQuestionIndex === 0;
    
    if (currentQuestionIndex === currentQuestions.length - 1) {
        nextBtn.style.display = "none";
        submitBtn.style.display = "flex";
    } else {
        nextBtn.style.display = "flex";
        submitBtn.style.display = "none";
    }
}

function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `Pregunta ${currentQuestionIndex + 1} de ${currentQuestions.length}`;
    document.querySelector(".progress-bar").setAttribute("aria-valuenow", currentQuestionIndex + 1);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        // Advertencia cuando quedan 5 minutos
        if (timeRemaining === 5 * 60) {
            timerElement.classList.add("timer-warning");
        }
        
        // Tiempo agotado
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            submitExam();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function saveProgress() {
    const progress = {
        questions: currentQuestions,
        answers: userAnswers,
        currentIndex: currentQuestionIndex,
        startTime: examStartTime,
        timeRemaining: timeRemaining
    };
    sessionStorage.setItem("examProgress", JSON.stringify(progress));
}

function submitExam() {
    // Verificar que todas las preguntas estén respondidas
    const unanswered = userAnswers.findIndex(answer => answer === null);
    if (unanswered !== -1) {
        const confirmSubmit = window.confirm(
            `Hay ${userAnswers.filter(a => a === null).length} pregunta(s) sin responder. ` +
            "¿Está seguro de que desea enviar el examen?"
        );
        if (!confirmSubmit) return;
    }
    
    clearInterval(timerInterval);
    
    // Calcular resultados
    const results = calculateResults();
    
    // Guardar resultados
    sessionStorage.setItem("examResults", JSON.stringify(results));
    
    // Mostrar resultados
    displayResults(results);
}

function calculateResults() {
    const endTime = new Date();
    const timeUsed = Math.floor((endTime - examStartTime) / 1000);
    
    let correctCount = 0;
    const detailedResults = [];
    
    currentQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correct;
        
        if (isCorrect) correctCount++;
        
        detailedResults.push({
            question: question.question,
            category: question.category,
            userAnswer: userAnswer !== null ? question.options[userAnswer] : "Sin responder",
            correctAnswer: question.options[question.correct],
            isCorrect: isCorrect,
            explanation: question.explanation
        });
    });
    
    const percentage = Math.round((correctCount / currentQuestions.length) * 100);
    const passed = percentage >= 70;
    
    return {
        correctCount,
        totalQuestions: currentQuestions.length,
        percentage,
        passed,
        timeUsed,
        detailedResults,
        userName: sessionStorage.getItem("userName"),
        userId: sessionStorage.getItem("userId"),
        userType: sessionStorage.getItem("userType"),
        completionDate: new Date().toLocaleString("es-ES")
    };
}

function displayResults(results) {
    examSection.style.display = "none";
    resultsSection.style.display = "block";
    reviewSection.style.display = "none";
    
    // Icono y mensaje según el resultado
    const resultIcon = document.getElementById("resultIcon");
    const resultTitle = document.getElementById("resultTitle");
    const resultMessage = document.getElementById("resultMessage");
    const examStatusElement = document.getElementById("examStatus");
    
    if (results.passed) {
        resultIcon.className = "fas fa-check-circle success";
        resultTitle.textContent = "¡Felicitaciones! Examen Aprobado";
        resultMessage.textContent = "Ha demostrado un buen conocimiento en seguridad de la información.";
        examStatusElement.textContent = "Aprobado";
        examStatusElement.style.color = "var(--success-color)";
        document.getElementById("certificateBtn").style.display = "flex";
    } else {
        resultIcon.className = "fas fa-times-circle danger";
        resultTitle.textContent = "Examen No Aprobado";
        resultMessage.textContent = "Necesita reforzar sus conocimientos en seguridad de la información.";
        examStatusElement.textContent = "No Aprobado";
        examStatusElement.style.color = "var(--error-color)";
        document.getElementById("certificateBtn").style.display = "none";
    }
    
    // Actualizar puntuación
    document.getElementById("scorePercentage").textContent = `${results.percentage}%`;
    document.getElementById("correctAnswers").textContent = `${results.correctCount}/${results.totalQuestions}`;
    
    const minutes = Math.floor(results.timeUsed / 60);
    const seconds = results.timeUsed % 60;
    document.getElementById("timeUsed").textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    
    // Actualizar círculo de progreso
    const scoreCircle = document.querySelector(".score-circle");
    const angle = (results.percentage / 100) * 360;
    scoreCircle.style.background = `conic-gradient(var(--primary-color) ${angle}deg, var(--bg-tertiary) ${angle}deg)`;
    
    // Generar recomendaciones
    const recommendationsElement = document.getElementById("recommendations");
    if (recommendationsElement) {
        generateRecommendations(results);
    }
}

function generateRecommendations(results) {
    const recommendations = document.getElementById("recommendations");
    const weakAreas = getWeakAreas(results.detailedResults);
    
    let recommendationHTML = "<h4><i class=\"fas fa-lightbulb\"></i> Recomendaciones para Mejorar:</h4><ul>";
    
    if (results.percentage < 70) {
        recommendationHTML += "<li>Revisar todos los contenidos del seminario de seguridad</li>";
        recommendationHTML += "<li>Practicar con ejercicios adicionales de ciberseguridad</li>";
    }
    
    if (weakAreas.length > 0) {
        recommendationHTML += `<li>Reforzar conocimientos en: ${weakAreas.join(", ")}</li>`;
    }
    
    recommendationHTML += "<li>Mantenerse actualizado con las últimas amenazas de seguridad</li>";
    recommendationHTML += "<li>Aplicar las mejores prácticas en su trabajo diario</li>";
    recommendationHTML += "</ul>";
    
    recommendations.innerHTML = recommendationHTML;
}

function getWeakAreas(detailedResults) {
    const categoryStats = {};
    
    detailedResults.forEach(result => {
        if (!categoryStats[result.category]) {
            categoryStats[result.category] = { correct: 0, total: 0 };
        }
        categoryStats[result.category].total++;
        if (result.isCorrect) {
            categoryStats[result.category].correct++;
        }
    });
    
    const weakAreas = [];
    Object.entries(categoryStats).forEach(([category, stats]) => {
        const percentage = (stats.correct / stats.total) * 100;
        if (percentage < 60) {
            weakAreas.push(category);
        }
    });
    
    return weakAreas;
}

function reviewAnswers() {
    const results = JSON.parse(sessionStorage.getItem("examResults"));
    if (!results) return;
    
    resultsSection.style.display = "none";
    reviewSection.style.display = "block";

    const reviewContainer = document.getElementById("reviewContainer");
    let reviewHTML = "";
    
    results.detailedResults.forEach((result, index) => {
        const statusClass = result.isCorrect ? "correct" : "incorrect";
        const statusIcon = result.isCorrect ? "check-circle" : "times-circle";
        
        reviewHTML += `
            <div class="review-item ${statusClass}">
                <div class="review-header">
                    <strong>Pregunta ${index + 1}</strong>
                    <span class="review-category">${result.category}</span>
                </div>
                <p class="review-question">${result.question}</p>
                <div class="review-answer user-answer ${statusClass}">
                    <strong>Su respuesta:</strong> 
                    <i class="fas fa-${statusIcon}"></i> ${result.userAnswer}
                </div>
                ${!result.isCorrect ? `
                    <div class="review-answer correct-answer">
                        <strong>Respuesta correcta:</strong> 
                        <i class="fas fa-check-circle"></i> ${result.correctAnswer}
                    </div>
                ` : ""}
                <div class="review-explanation">
                    <strong>Explicación:</strong> ${result.explanation}
                </div>
            </div>
        `;
    });
    
    reviewContainer.innerHTML = reviewHTML;
}

function retryExam() {
    if (confirm("¿Está seguro de que desea reiniciar el examen? Se perderá todo el progreso actual.")) {
        // Limpiar datos del examen
        sessionStorage.removeItem("examProgress");
        sessionStorage.removeItem("examResults");
        
        // Resetear variables
        currentQuestions.length = 0;
        currentQuestionIndex = 0;
        userAnswers.length = 0;
        examStartTime = null;
        timeRemaining = timeLimit;
        
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        // Volver a la pantalla de bienvenida
        resultsSection.style.display = "none";
        examSection.style.display = "none";
        reviewSection.style.display = "none";
        welcomeSection.style.display = "block";
        
        // Limpiar timer warning
        timerElement.classList.remove("timer-warning");
        updateTimerDisplay();
    }
}

function downloadCertificate() {
    const results = JSON.parse(sessionStorage.getItem("examResults"));
    if (!results || !results.passed) return;
    
    const date = new Date();
    const optionsDate = { day: "numeric", month: "long", year: "numeric" };
    const formattedDate = date.toLocaleDateString("es-ES", optionsDate);
    const completionDateText = `Ciudad Evita (Bs As), ${formattedDate}`;

    const userName = results.userName || "[Nombre del Participante]";
    const userId = results.userId || "[DNI del Participante]";

    // Generar datos estructurados para QR Code con información verificable
    const certificateId = `CERT-${Date.now()}-${userId}`;
    const qrData = JSON.stringify({
        certificateId: certificateId,
        participantName: userName,
        dni: userId,
        seminar: "Seminario El lado oculto de la Seguridad de la Información",
        institution: "Instituto Universitario de Gendarmería Nacional Argentina (IUGNA)",
        date: completionDateText,
        score: `${results.percentage}%`,
        status: "APROBADO",
        issueDate: new Date().toISOString(),
        verificationUrl: `https://canaric.github.io/cyberevaluacion/verify?id=${certificateId}`
    });
    
    const qrCodeContainer = document.createElement("div");
    qrCodeContainer.id = "qrcode";
    qrCodeContainer.style.width = "120px";
    qrCodeContainer.style.height = "120px";
    qrCodeContainer.style.margin = "20px auto";

    const qrcode = new QRCodeStyling({
        width: 110,
        height: 110,
        type: "svg",
        data: qrData,
        dotsOptions: {
            color: "#000000",
            type: "rounded"
        },
        backgroundOptions: {
            color: "#ffffff"
        },
        cornersSquareOptions: {
            color: "#000000",
            type: "square"
        },
        cornersDotOptions: {
            color: "#000000",
            type: "square"
        }
    });

    // Render QR code to a temporary div to get SVG
    qrcode.append(qrCodeContainer);

    // Wait for QR code to render (it's async)
    setTimeout(() => {
        const qrSvg = qrCodeContainer.querySelector("svg").outerHTML;
        qrCodeContainer.remove();

        const certificateHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Certificado</title>
                <style>
                    @page { size: A4; margin: 15mm; }
                    body { 
                        margin: 0; 
                        padding: 0; 
                        font-family: 'Times New Roman', serif; 
                        background: white; 
                        color: black; 
                        line-height: 1.4;
                    }
                    .certificate { 
                        width: 100%; 
                        max-width: 210mm; 
                        margin: 0 auto; 
                        text-align: center; 
                        position: relative;
                        min-height: 297mm;
                        padding: 20mm;
                        box-sizing: border-box;
                    }
                    .header { 
                        margin-bottom: 40px; 
                        border-bottom: 2px solid #000;
                        padding-bottom: 20px;
                    }
                    .logo { 
                        width: 60px; 
                        height: 60px; 
                        margin: 0 15px; 
                        filter: grayscale(100%);
                    }
                    .main-title { 
                        font-size: 36px; 
                        font-weight: bold; 
                        margin: 20px 0; 
                        color: black;
                        letter-spacing: 3px;
                        text-decoration: underline;
                    }
                    .subtitle { 
                        font-size: 18px; 
                        margin: 10px 0; 
                        font-style: italic;
                    }
                    .institution { 
                        font-size: 14px; 
                        margin: 5px 0; 
                        font-weight: bold;
                    }
                    .content { 
                        margin: 60px 0; 
                        text-align: center;
                    }
                    .participant-name { 
                        font-size: 25px; 
                        font-weight: bold; 
                        margin: 30px 0; 
                        color: black; 
                        text-decoration: none;
                        letter-spacing: 2px;
                    }
                    .text { 
                        font-size: 16px; 
                        line-height: 1.6; 
                        margin: 20px 0; 
                        text-align: justify;
                        text-align-last: center;
                    }
                    .signatures { 
                        display: flex; 
                        justify-content: space-between; 
                        margin-top: 80px;
                        margin-bottom: 40px;
                    }
                    .signature-block { 
                        text-align: center; 
                        width: 30%;
                    }
                    .signature-line { 
                        width: 180px; 
                        height: 1px; 
                        background: black; 
                        margin: 0 auto 10px; 
                    }
                    .signature-name { 
                        font-size: 12px; 
                        font-weight: bold; 
                        margin: 5px 0; 
                        line-height: 1.2;
                    }
                    .signature-title { 
                        font-size: 10px; 
                        margin: 0; 
                        font-style: italic;
                    }
                    .qr-section {
                        position: absolute;
                        bottom: 20mm;
                        left: 50%;
                        transform: translateX(-50%);
                        text-align: center;
                    }
                    .qr-text {
                        font-size: 10px;
                        margin-top: 10px;
                        color: #666;
                    }
                    .certificate-id {
                        font-size: 10px;
                        color: #666;
                        margin-top: 5px;
                    }
                </style>
            </head>
            <body>
                <div class="certificate">
                    <div class="header">
                        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 20px;">
                            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiMwMDAiLz4KPHN2ZyB4PSIxNSIgeT0iMTUiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPgo8L3N2Zz4=" class="logo" alt="Gendarmería Logo">
                            <div style="margin: 0 20px;">
                                <h1 class="main-title">CERTIFICADO</h1>
                                <p class="subtitle">Seminario "El lado oculto de la Seguridad de la Información"</p>
                            </div>
                            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiMwMDAiLz4KPHN2ZyB4PSIxMCIgeT0iMTAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDJMMTQuMDkgOC4yNkwyMSA5TDE0LjA5IDE1Ljc0TDEyIDIyTDkuOTEgMTUuNzRMMyA5TDkuOTEgOC4yNkwxMiAyWiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4KPC9zdmc+" class="logo" alt="IUGNA Logo">
                        </div>
                        <p class="institution">Escuela de Gendarmería Nacional "Grl Don Martín Miguel de Güemes"</p>
                        <p class="institution">Instituto Universitario de Gendarmería Nacional Argentina (IUGNA)</p>
                    </div>
                    <div class="content">
                        <p class="text">Se certifica que</p>
                        <p class="participant-name">${userName}</p>
                        <p class="text"><strong>DNI: ${userId}</strong></p>
                        <p class="text">ha participado exitosamente del Seminario "El Lado Oculto de la Seguridad de la Información" y ha aprobado la evaluación correspondiente con una calificación de <strong>${results.percentage}%</strong>.</p>
                        <p class="text">Se extiende el presente certificado en ${completionDateText}.</p>
                    </div>
                    <div class="signatures">
                        <div class="signature-block">
                            <div class="signature-line"></div>
                            <p class="signature-name">Cte My Ing. Ricardo Alcides CANAVERI</p>
                            <p class="signature-title">Disertante Panel 1</p>
                        </div>
                        <div class="signature-block">
                            <div class="signature-line"></div>
                            <p class="signature-name">Cte My (R) Ing. Juan Ariel ENCINA</p>
                            <p class="signature-title">Disertante Panel 2</p>
                        </div>
                        <div class="signature-block">
                            <div class="signature-line"></div>
                            <p class="signature-name">Mg. Ignacio MALERBA</p>
                            <p class="signature-title">Disertante Panel 3</p>
                        </div>
                    </div>
                    <div class="qr-section">
                        ${qrSvg}
                        <p class="qr-text">Escanee para verificar autenticidad</p>
                        <p class="certificate-id">ID: ${certificateId}</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        const certificateWindow = window.open("", "_blank", "width=800,height=1131,scrollbars=yes");
        certificateWindow.document.write(certificateHTML);
        certificateWindow.document.close();
        certificateWindow.print();
    }, 500);
}

// Función auxiliar para obtener preguntas aleatorias
function getRandomQuestions(num) {
    if (!questionBank || questionBank.length === 0) {
        console.error("questionBank no está disponible");
        return [];
    }
    
    // Crear una copia del array para no modificar el original
    const shuffled = [...questionBank];
    
    // Algoritmo Fisher-Yates para mezclar el array
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Retornar el número solicitado de preguntas
    return shuffled.slice(0, Math.min(num, shuffled.length));
}




// === Deadline & Countdown (retro) ===
(function(){
  const deadline = new Date('2025-08-22T00:00:00-03:00');
  function fmtDate(d){
    try {
      return new Intl.DateTimeFormat('es-AR', { dateStyle: 'full', timeStyle: 'short', timeZone: 'America/Argentina/Buenos_Aires' }).format(d).replace(',', '');
    } catch(_){ return '22 de agosto de 2025, 00:00'; }
  }
  const dd1 = document.getElementById('deadlineDate'); // legacy
  const dd2 = document.getElementById('retroDeadlineDate'); // retro
  if (dd1) dd1.textContent = fmtDate(deadline);
  if (dd2) dd2.textContent = fmtDate(deadline);

  function pad(n){ return String(n).padStart(2,'0'); }
  function tick(){
    const now = new Date();
    let diff = deadline - now;
    if (diff < 0) diff = 0;
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const legacy = [['cdDays','cdHours','cdMinutes']];
    const retro  = [['retroDays','retroHours','retroMinutes','retroSeconds']];

    // Legacy update (sin segundos)
    for (const [dId,hId,mId] of legacy){
      const dEl = document.getElementById(dId);
      const hEl = document.getElementById(hId);
      const mEl = document.getElementById(mId);
      if (dEl && hEl && mEl){
        dEl.textContent = pad(days);
        hEl.textContent = pad(hours);
        mEl.textContent = pad(minutes);
      }
    }
    // Retro update (con segundos)
    for (const [dId,hId,mId,sId] of retro){
      const dEl = document.getElementById(dId);
      const hEl = document.getElementById(hId);
      const mEl = document.getElementById(mId);
      const sEl = document.getElementById(sId);
      if (dEl && hEl && mEl && sEl){
        dEl.textContent = pad(days);
        hEl.textContent = pad(hours);
        mEl.textContent = pad(minutes);
        sEl.textContent = pad(seconds);
      }
    }
  }
  tick();
  setInterval(tick, 1000); // ahora cada segundo para mostrar "SEG"
})();
