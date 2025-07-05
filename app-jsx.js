import { useState } from 'react'

function App() {
  const [step, setStep] = useState('form') // 'form', 'questions', 'results'
  const [formData, setFormData] = useState({
    ruc: '',
    razonSocial: '',
    contacto: '',
    tipoContacto: 'email'
  })
  const [answers, setAnswers] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [errors, setErrors] = useState({})

  const questions = [
    "¿Tiene su RUC activo y sin sanciones vigentes?",
    "¿Cuenta con al menos un año de haber iniciado actividades comerciales?",
    "¿Tiene al menos una persona en planilla con antigüedad mayor a 3 meses?",
    "¿Cuenta con experiencia comprobable con al menos un cliente corporativo?",
    "¿Tiene estados financieros auditados o firmados por contador colegiado?",
    "¿Cuenta con algún sistema de gestión implementado (ISO 9001, SST, Ambiental u otros)?",
    "¿Tiene un responsable comercial o administrativo que atiende requerimientos en tiempo oportuno?",
    "¿Puede cumplir con plazos de entrega exigentes sin afectar la calidad del producto o servicio?"
  ]

  // Validaciones
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone) => {
    const phoneRegex = /^(\+?51)?9\d{8}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const validateRUC = (ruc) => {
    return ruc.length === 11 && /^\d+$/.test(ruc)
  }

  // Manejar cambios en el formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  // Validar formulario inicial
  const validateForm = () => {
    const newErrors = {}

    if (!formData.ruc.trim()) {
      newErrors.ruc = 'El RUC es obligatorio'
    } else if (!validateRUC(formData.ruc)) {
      newErrors.ruc = 'El RUC debe tener 11 dígitos'
    }

    if (!formData.razonSocial.trim()) {
      newErrors.razonSocial = 'La razón social es obligatoria'
    }

    if (!formData.contacto.trim()) {
      newErrors.contacto = 'El contacto es obligatorio'
    } else {
      if (formData.tipoContacto === 'email' && !validateEmail(formData.contacto)) {
        newErrors.contacto = 'Ingrese un correo electrónico válido'
      } else if (formData.tipoContacto === 'whatsapp' && !validatePhone(formData.contacto)) {
        newErrors.contacto = 'Ingrese un número de WhatsApp válido (9 dígitos)'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Avanzar a las preguntas
  const handleSubmitForm = () => {
    if (validateForm()) {
      setStep('questions')
    }
  }

  // Manejar respuesta a pregunta
  const handleAnswer = (answer) => {
    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setStep('results')
    }
  }

  // Calcular resultado
  const calculateResult = () => {
    const positiveAnswers = answers.filter(answer => answer === 'yes').length
    
    if (positiveAnswers >= 7) {
      return {
        level: 'ALTO',
        className: 'alto',
        icon: '🟢',
        message: '¡Excelente! Su empresa muestra un alto nivel de preparación para ser proveedor de grandes empresas.'
      }
    } else if (positiveAnswers >= 4) {
      return {
        level: 'MEDIO',
        className: 'medio',
        icon: '🟡',
        message: 'Su empresa tiene una base sólida, pero hay áreas de mejora importantes para ser más competitiva.'
      }
    } else {
      return {
        level: 'BAJO',
        className: 'bajo',
        icon: '🔴',
        message: 'Su empresa necesita fortalecer varios aspectos fundamentales antes de postular como proveedor.'
      }
    }
  }

  // Reiniciar evaluación
  const resetEvaluation = () => {
    setStep('form')
    setFormData({
      ruc: '',
      razonSocial: '',
      contacto: '',
      tipoContacto: 'email'
    })
    setAnswers([])
    setCurrentQuestion(0)
    setErrors({})
  }

  // Renderizar formulario inicial
  if (step === 'form') {
    return (
      <div className="container">
        <div className="card">
          <div className="header">
            <h1>🏢 Autoevaluación PYME</h1>
            <p>Evalúa qué tan preparada está tu empresa para ser proveedor de grandes corporaciones</p>
          </div>

          <div className="form-group">
            <label htmlFor="ruc">
              RUC <span className="required">*</span>
            </label>
            <input
              id="ruc"
              type="text"
              placeholder="Ingrese el RUC (11 dígitos)"
              value={formData.ruc}
              onChange={(e) => handleInputChange('ruc', e.target.value.replace(/\D/g, '').slice(0, 11))}
              className={errors.ruc ? 'error' : ''}
              maxLength="11"
            />
            {errors.ruc && <div className="error-message">{errors.ruc}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="razonSocial">
              Razón Social <span className="required">*</span>
            </label>
            <input
              id="razonSocial"
              type="text"
              placeholder="Ingrese la razón social completa"
              value={formData.razonSocial}
              onChange={(e) => handleInputChange('razonSocial', e.target.value)}
              className={errors.razonSocial ? 'error' : ''}
            />
            {errors.razonSocial && <div className="error-message">{errors.razonSocial}</div>}
          </div>

          <div className="form-group">
            <label>
              Tipo de contacto <span className="required">*</span>
            </label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="tipoContacto"
                  value="email"
                  checked={formData.tipoContacto === 'email'}
                  onChange={(e) => handleInputChange('tipoContacto', e.target.value)}
                />
                📧 Correo electrónico
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="tipoContacto"
                  value="whatsapp"
                  checked={formData.tipoContacto === 'whatsapp'}
                  onChange={(e) => handleInputChange('tipoContacto', e.target.value)}
                />
                📱 WhatsApp
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="contacto">
              {formData.tipoContacto === 'email' ? 'Correo electrónico' : 'Número de WhatsApp'} <span className="required">*</span>
            </label>
            <input
              id="contacto"
              type={formData.tipoContacto === 'email' ? 'email' : 'tel'}
              placeholder={formData.tipoContacto === 'email' ? 'correo@empresa.com' : '987654321'}
              value={formData.contacto}
              onChange={(e) => handleInputChange('contacto', e.target.value)}
              className={errors.contacto ? 'error' : ''}
            />
            {errors.contacto && <div className="error-message">{errors.contacto}</div>}
          </div>

          <button 
            className="btn"
            onClick={handleSubmitForm}
          >
            🚀 Iniciar Evaluación
          </button>

          <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#7f8c8d', textAlign: 'center' }}>
            <p><span className="required">*</span> Campos obligatorios</p>
            <p>Sin estos datos no podrá continuar con la evaluación</p>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar preguntas
  if (step === 'questions') {
    const progress = ((currentQuestion + 1) / questions.length) * 100

    return (
      <div className="container">
        <div className="card">
          <div className="question-container">
            <div className="question-counter">
              Pregunta {currentQuestion + 1} de {questions.length}
            </div>
            
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="question">
              {questions[currentQuestion]}
            </div>

            <div className="question-buttons">
              <button 
                className="btn btn-yes"
                onClick={() => handleAnswer('yes')}
              >
                ✅ SÍ
              </button>
              <button 
                className="btn btn-no"
                onClick={() => handleAnswer('no')}
              >
                ❌ NO
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar resultados
  if (step === 'results') {
    const result = calculateResult()
    const positiveAnswers = answers.filter(answer => answer === 'yes').length

    return (
      <div className="container">
        <div className="card">
          <div className="result-container">
            <div className="result-icon">
              {result.icon}
            </div>
            
            <div className={`result-level ${result.className}`}>
              Nivel de preparación: {result.level}
            </div>

            <div className="result-message">
              {result.message}
            </div>

            <div className="result-stats">
              <p><strong>Empresa:</strong> {formData.razonSocial}</p>
              <p><strong>RUC:</strong> {formData.ruc}</p>
              <p><strong>Respuestas afirmativas:</strong> {positiveAnswers} de {questions.length}</p>
              <p><strong>Porcentaje:</strong> {Math.round((positiveAnswers / questions.length) * 100)}%</p>
            </div>

            <div className="final-message">
              <h3>📞 Gracias por completar tu autoevaluación, {formData.razonSocial}</h3>
              <p>
                Soy <strong>José Terrones</strong>, facilitador de grandes empresas y proveedores confiables.
              </p>
              <p>
                Puedo ayudarte a mejorar tu perfil como proveedor, prepararte para una evaluación real 
                o presentarte oportunidades en futuras convocatorias empresariales.
              </p>
              <p>
                📧 Te hemos enviado el resultado a tu {formData.tipoContacto === 'email' ? 'correo electrónico' : 'WhatsApp'}.
              </p>
              <p>
                💬 Si deseas una asesoría gratuita, puedes contactarme respondiendo al mensaje.
              </p>
            </div>

            <button 
              className="btn btn-restart"
              onClick={resetEvaluation}
            >
              🔄 Realizar Nueva Evaluación
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default App