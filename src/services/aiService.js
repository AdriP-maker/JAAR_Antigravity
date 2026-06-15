/**
 * aiService.js — SIMAP Digital
 * Integración con Inteligencia Artificial para el Cobrador
 */

import { getPagosUsuario, getResumenUsuario } from './pagosService';

/**
 * Simula el cálculo del comportamiento del usuario basado en sus pagos
 */
async function analizarComportamiento(userId) {
  const resumen = await getResumenUsuario(userId);
  const pagos = await getPagosUsuario(userId);

  if (resumen.deuda === 0) return 'puntual';
  if (resumen.mesesDeuda === 1) return 'olvidadizo';
  if (resumen.mesesDeuda >= 2) return 'moroso';
  return 'indefinido';
}

/**
 * Genera una sugerencia de cobranza (Mensaje o Ruta) llamando a un LLM
 */
export async function getSugerenciaCobrador(usuarioTarget) {
  try {
    const perfil = await analizarComportamiento(usuarioTarget.id);
    const resumen = await getResumenUsuario(usuarioTarget.id);

    const promptText = `
      Actúa como asistente cordial de cobros para una Junta de Agua (SIMAP).
      Cliente: ${usuarioTarget.nombre} (${usuarioTarget.sector})
      Deuda actual: B/. ${resumen.deuda.toFixed(2)} (${resumen.mesesDeuda} meses)
      Perfil: ${perfil}

      Instrucción:
      Si es 'puntual', redacta un agradecimiento corto.
      Si es 'olvidadizo', un recordatorio amable por WhatsApp.
      Si es 'moroso', un mensaje firme pero empático ofreciendo un plan de pago o que se acerque a la directiva.
      REGLA IMPORTANTE: Solo acepta efectivo. Nunca ofrezcas Yappy, transferencias ni depósitos.
    `;

    // Intentar usar window.ai (Chrome's Built-in AI) si está disponible
    if (window.ai && window.ai.createTextSession) {
      const session = await window.ai.createTextSession();
      const response = await session.prompt(promptText);
      return { success: true, text: response };
    } 
    
    // Fallback: Simulador si no hay API disponible
    // En el futuro aquí se puede conectar a la API de OpenAI usando process.env.VITE_OPENAI_API_KEY
    return { 
      success: true, 
      text: perfil === 'puntual' 
        ? `¡Hola ${usuarioTarget.nombre}! Gracias por estar al día. Tu buen comportamiento nos ayuda a mantener el agua fluyendo.` 
        : `Hola ${usuarioTarget.nombre}, soy de la Junta de Agua. Vemos un saldo pendiente de B/. ${resumen.deuda.toFixed(2)}. Recuerda que el pago solo se realiza en efectivo con nuestro cobrador o en la junta. ¡Saludos!` 
    };

  } catch (error) {
    console.error("AI Error:", error);
    return { success: false, text: "No se pudo conectar con el motor de IA." };
  }
}
