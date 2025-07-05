// ===================================
// APP.JS - ARCHIVO PRINCIPAL
// ===================================

import React, { useState } from 'react';
import { ChevronRight, Building2, Mail, Phone, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

// CONFIGURACIÓN - REEMPLAZA CON TUS URLs REALES
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/TU_SCRIPT_ID/exec';
const MAKE_WEBHOOK_URL = 'https://hook.integromat.com/TU_WEBHOOK_ID'; // Opcional

const PymeEvaluationApp = () => {
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({
    razonSocial: '',
    ruc: '',
    contacto: '',
    tipoContacto: 'email'
  });
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = [
    "¿Tiene su RUC activo y sin sanciones vigentes?",
    "¿Cuenta con al menos un año de haber iniciado actividades comerciales?",
    "¿Tiene al menos una persona en planilla con antigüedad mayor a 3 meses?",
    "¿Cuenta con experiencia comprobable con al menos un cliente corporativo?",
    "¿Tiene estados financieros auditados o firmados por contador colegiado?",
    "¿Cuenta con algún sistema de gestión implementado (ISO 9001, SST, Ambiental u otros)?",
    "¿Tiene un responsable comercial o administrativo que atiende requerimientos en tiempo oportuno?",
    "¿Puede cumplir con plazos de entrega exigentes sin afectar la calidad del producto o servicio?"
  ];

  // Validaciones
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^(\+?51)?9\d{8}$/.test(phone.replace(/\s/g, ''));
  };

  // Enviar datos a sistemas externos
  const sendToGoogleSheets = async (data) => {
    try {
      const response = await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      console.log('Datos enviados a Google Sheets');
      return true;
    } catch (error) {
      console.error('Error enviando a Google Sheets:', error);
      return false;
    }
  };

  const sendToMake = async (data) => {
    try {
      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      console.log('Datos enviados a Make.com');
      return true;
    } catch (error) {
      console.error('Error enviando a Make:', error);
      return false;
    }
  };

  // Manejar envío del formulario inicial
  const handleFormSubmit = () => {
    const { razonSocial, ruc, contacto, tipoContacto } = formData;
    
    if (!razonSocial.trim() || !ruc.trim() || !contacto.trim()) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }

    if (tipoContacto === 'email' && !validateEmail(contacto)) {
      alert('Por favor, ingrese un correo electrónico válido.');
      return;
    }

    if (tipoContacto === 'whatsapp' && !validatePhone(contacto)) {
      alert('Por favor, ingrese un número de WhatsApp válido (9 dígitos).');
      return;
    }

    setStep('questions');
  };

  // Manejar respuestas y finalizar evaluación
  const handleAnswer = async (answer) => {
    const newAnswers = { ...answers, [currentQuestion]: answer };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Última pregunta - procesar resultados
      setIsSubmitting(true);
      await processResults(newAnswers);
      setIsSubmitting(false);
      setStep('results');
    }
  };

  // Procesar resultados y enviar datos
  const processResults = async (finalAnswers) => {
    const positiveAnswers = Object.values(finalAnswers).filter(answer => answer === 'yes').length;
    
    // Calcular nivel
    let nivel;
    if (positiveAnswers >= 7) nivel = 'ALTO';
    else if (positiveAnswers >= 4) nivel = 'MEDIO';
    else nivel = 'BAJO';

    // Preparar datos para envío
    const dataToSend = {
      timestamp: new Date().toISOString(),
      fechaLocal: new Date().toLocaleString('es-PE'),
      razonSocial: formData.razonSocial,
      ruc: formData.ruc,
      contacto: formData.contacto,
      tipoContacto: formData.tipoContacto,
      respuestasPositivas: positiveAnswers,
      totalPreguntas: questions.length,
      nivel: nivel,
      porcentaje: Math.round((positiveAnswers / questions.length) * 100),
      respuestasDetalle: finalAnswers,
      // Datos adicionales para automatización
      requiresFollowUp: nivel === 'BAJO' || nivel === 'MEDIO',
      priority: nivel === 'ALTO' ? 'high' : nivel === 'MEDIO' ? 'medium' : 'low'
    };

    // Enviar a ambos sistemas
    try {
      await Promise.all([
        sendToGoogleSheets(dataToSend),
        sendToMake(dataToSend)
      ]);
    } catch (error) {
      console.error('Error enviando datos:', error);
    }
  };

  // Calcular resultado para mostrar
  const calculateResult = () => {
    const positiveAnswers = Object.values(answers).filter(answer => answer === 'yes').length;
    
    if (positiveAnswers >= 7) {
      return {
        level: 'ALTO',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: CheckCircle,
        message: '¡Excelente! Su empresa muestra un alto nivel de preparación para ser proveedor de grandes empresas.'
      };
    } else if (positiveAnswers >= 4) {
      return {
        level: 'MEDIO',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: AlertCircle,
        message: 'Su empresa tiene una base sólida, pero hay áreas de mejora importantes para ser más competitiva.'
      };
    } else {
      return {
        level: 'BAJO',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: XCircle,
        message: 'Su empresa necesita fortalecer varios aspectos fundamentales antes de postular como proveedor.'
      };
    }
  };

  const result = step === 'results' ? calculateResult() : null;
  const ResultIcon = result?.icon;

  // PANTALLA 1: FORMULARIO INICIAL
  if (step === 'form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <Building2 className="mx-auto h-16 w-16 text-blue-600 mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Autoevaluación PYME
              </h1>
              <p className="text-lg text-gray-600">
                Evalúa qué tan preparada está tu empresa para ser proveedor de grandes corporaciones
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Razón Social de la Empresa *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ingrese la razón social completa"
                  value={formData.razonSocial}
                  onChange={(e) => setFormData({...formData, razonSocial: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  RUC *
                </label>
                <input
                  type="text"
                  maxLength="11"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ingrese el RUC (11 dígitos)"
                  value={formData.ruc}
                  onChange={(e) => setFormData({...formData, ruc: e.target.value.replace(/\D/g, '')})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Medio de contacto para recibir resultados *
                </label>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="tipoContacto"
                      value="email"
                      checked={formData.tipoContacto === 'email'}
                      onChange={(e) => setFormData({...formData, tipoContacto: e.target.value, contacto: ''})}
                      className="mr-2"
                    />
                    <Mail className="w-4 h-4 mr-1" />
                    Correo electrónico
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="tipoContacto"
                      value="whatsapp"
                      checked={formData.tipoContacto === 'whatsapp'}
                      onChange={(e) => setFormData({...formData, tipoContacto: e.target.value, contacto: ''})}
                      className="mr-2"
                    />
                    <Phone className="w-4 h-4 mr-1" />
                    WhatsApp
                  </label>
                </div>
                <input
                  type={formData.tipoContacto === 'email' ? 'email' : 'tel'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={formData.tipoContacto === 'email' ? 'correo@empresa.com' : '987654321'}
                  value={formData.contacto}
                  onChange={(e) => setFormData({...formData, contacto: e.target.value})}
                />
              </div>

              <button
                onClick={handleFormSubmit}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Iniciar Evaluación
                <ChevronRight className="ml-2 w-5 h-5" />
              </button>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
              <p>* Campos obligatorios</p>
              <p className="mt-2">Sin estos datos no podrá continuar con la evaluación</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PANTALLA 2: PREGUNTAS
  if (step === 'questions') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-500">
                  Pregunta {currentQuestion + 1} de {questions.length}
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                {questions[currentQuestion]}
              </h2>

              {isSubmitting ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Procesando resultados...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => handleAnswer('yes')}
                    className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors"
                  >
                    SÍ
                  </button>
                  <button
                    onClick={() => handleAnswer('no')}
                    className="w-full bg-red-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors"
                  >
                    NO
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PANTALLA 3: RESULTADOS
  if (step === 'results') {
    const positiveAnswers = Object.values(answers).filter(answer => answer === 'yes').length;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${result.bgColor} mb-4`}>
                <ResultIcon className={`w-10 h-10 ${result.color}`} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Resultado de su Evaluación
              </h2>
              <div className={`inline-block px-6 py-2 rounded-full ${result.bgColor} ${result.color} font-bold text-lg`}>
                Nivel de preparación: {result.level}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <p className="text-lg text-gray-700 text-center mb-4">
                {result.message}
              </p>
              <p className="text-center text-gray-600">
                <strong>Respuestas afirmativas:</strong> {positiveAnswers} de {questions.length}
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
              <p className="text-gray-700 mb-4">
                <strong>Gracias por completar tu autoevaluación, {formData.razonSocial}.</strong>
              </p>
              <p className="text-gray-700 mb-4">
                Soy <strong>José Terrones</strong>, facilitador de grandes empresas y proveedores confiables.
              </p>
              <p className="text-gray-700 mb-4">
                Puedo ayudarte a mejorar tu perfil como proveedor, prepararte para una evaluación real o presentarte oportunidades en futuras convocatorias empresariales.
              </p>
              <p className="text-gray-700 mb-2">
                📥 Te hemos enviado el resultado a tu {formData.tipoContacto === 'email' ? 'correo' : 'WhatsApp'}.
              </p>
              <p className="text-gray-700">
                📞 Si deseas una asesoría gratuita, puedes contactarme respondiendo al mensaje.
              </p>
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => {
                  setStep('form');
                  setFormData({razonSocial: '', ruc: '', contacto: '', tipoContacto: 'email'});
                  setAnswers({});
                  setCurrentQuestion(0);
                }}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Realizar Nueva Evaluación
              </button>
            </div>
          </div>

          <footer className="text-center mt-8 text-gray-600 text-sm">
            © 2025 José Terrones – Facilitador entre grandes empresas y proveedores confiables
          </footer>
        </div>
      </div>
    );
  }

  return null;
};

export default PymeEvaluationApp;

// ===================================
// GOOGLE APPS SCRIPT PARA SHEETS
// ===================================

/*
Crea un nuevo Google Apps Script en script.google.com y pega este código:

function doPost(e) {
  try {
    // Parsear datos recibidos
    const data = JSON.parse(e.postData.contents);
    
    // ID de tu Google Sheet (reemplaza con el tuyo)
    const SHEET_ID = 'TU_GOOGLE_SHEET_ID_AQUI';
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    // Si es la primera vez, crear headers
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 12).setValues([[
        'Fecha',
        'Razón Social', 
        'RUC',
        'Contacto',
        'Tipo Contacto',
        'Resp. Positivas',
        'Total Preguntas',
        'Porcentaje',
        'Nivel',
        'Requiere Seguimiento',
        'Prioridad',
        'Estado'
      ]]);
      
      // Formatear headers
      const headerRange = sheet.getRange(1, 1, 1, 12);
      headerRange.setBackground('#1e3c72');
      headerRange.setFontColor('white');
      headerRange.setFontWeight('bold');
    }
    
    // Agregar nueva fila con datos
    sheet.appendRow([
      data.fechaLocal,
      data.razonSocial,
      data.ruc,
      data.contacto,
      data.tipoContacto,
      data.respuestasPositivas,
      data.totalPreguntas,
      data.porcentaje + '%',
      data.nivel,
      data.requiresFollowUp ? 'SÍ' : 'NO',
      data.priority.toUpperCase(),
      'Pendiente'
    ]);
    
    // Aplicar formato condicional a la nueva fila
    const lastRow = sheet.getLastRow();
    const levelCell = sheet.getRange(lastRow, 9); // Columna nivel
    
    if (data.nivel === 'ALTO') {
      levelCell.setBackground('#c6f6d5');
      levelCell.setFontColor('#2d7748');
    } else if (data.nivel === 'MEDIO') {
      levelCell.setBackground('#fed7d7');
      levelCell.setFontColor('#c53030');
    } else {
      levelCell.setBackground('#fed7d7');
      levelCell.setFontColor('#c53030');
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Datos guardados correctamente'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Función para testing (opcional)
function testFunction() {
  const testData = {
    fechaLocal: new Date().toLocaleString('es-PE'),
    razonSocial: 'Empresa Test SAC',
    ruc: '12345678901',
    contacto: 'test@empresa.com',
    tipoContacto: 'email',
    respuestasPositivas: 6,
    totalPreguntas: 8,
    porcentaje: 75,
    nivel: 'MEDIO',
    requiresFollowUp: true,
    priority: 'medium'
  };
  
  console.log('Datos de prueba:', testData);
}
*/

// ===================================
// PACKAGE.JSON PARA REACT
// ===================================

/*
{
  "name": "pyme-evaluation-app",
  "version": "1.0.0",
  "description": "Aplicación de autoevaluación para PYMEs",
  "main": "src/index.js",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "lucide-react": "^0.263.1"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
*/

// ===================================
// ARCHIVO INDEX.JS
// ===================================

/*
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import PymeEvaluationApp from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PymeEvaluationApp />
  </React.StrictMode>
);
*/

// ===================================
// ARCHIVO INDEX.CSS (TAILWIND)
// ===================================

/*
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}
*/