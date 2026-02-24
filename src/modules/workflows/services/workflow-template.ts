// src/lib/workflows/workflow-template.ts
import type { WorkflowTemplate } from './workflow-types'

class WorkflowTemplateManager {
  async getBase(): Promise<WorkflowTemplate> {
    const templateJson = await this.loadWorkerTemplate()

    return {
      id: 'base-whatsapp-workflow',
      name: 'WhatsApp Automation Base Template',
      description: 'Template base para automatización de WhatsApp con IA',
      version: 'v1.0.0',
      workflow_json: templateJson,
      editable_params: [
        'config.ai_model',
        'config.prompts.profiler',
        'config.prompts.strategist',
        'config.prompts.mirror',
        'config.business_settings.response_delay',
        'config.business_settings.max_retries',
        'config.business_settings.office_hours',
      ],
    }
  }

  private async loadWorkerTemplate(): Promise<any> {
    // Mock simplificado del template M1.B - Worker
    return {
      name: 'WhatsApp Worker',
      nodes: [
        {
          id: 'webhook',
          name: 'Webhook WhatsApp',
          type: 'n8n-nodes-base.webhook',
          position: [250, 300],
        },
        {
          id: 'profiler',
          name: 'The Profiler',
          type: 'n8n-nodes-base.openAi',
          position: [450, 300],
          parameters: {
            model: '{{ $json.config.ai_model }}',
            prompt: '{{ $json.config.prompts.profiler }}',
          },
        },
        {
          id: 'strategist',
          name: 'The Strategist',
          type: 'n8n-nodes-base.openAi',
          position: [650, 300],
          parameters: {
            model: '{{ $json.config.ai_model }}',
            prompt: '{{ $json.config.prompts.strategist }}',
          },
        },
        {
          id: 'mirror',
          name: 'The Mirror',
          type: 'n8n-nodes-base.openAi',
          position: [850, 300],
          parameters: {
            model: '{{ $json.config.ai_model }}',
            prompt: '{{ $json.config.prompts.mirror }}',
          },
        },
        {
          id: 'send-whatsapp',
          name: 'Enviar WhatsApp',
          type: 'n8n-nodes-base.whatsApp',
          position: [1050, 300],
        },
      ],
      connections: {
        webhook: { main: [[{ node: 'profiler', type: 'main', index: 0 }]] },
        profiler: { main: [[{ node: 'strategist', type: 'main', index: 0 }]] },
        strategist: { main: [[{ node: 'mirror', type: 'main', index: 0 }]] },
        mirror: { main: [[{ node: 'send-whatsapp', type: 'main', index: 0 }]] },
      },
    }
  }

  get defaultPrompts() {
    return {
      profiler: `Eres un experto en análisis de clientes. Tu tarea es extraer información clave del mensaje del cliente:
- Necesidad principal
- Presupuesto estimado
- Urgencia
- Puntos de dolor

Analiza el siguiente mensaje y extrae estos datos en formato JSON.`,

      strategist: `Eres un estratega de ventas experto. Basándote en el perfil del cliente, diseña una estrategia de venta que:
- Aborde sus necesidades específicas
- Se ajuste a su presupuesto
- Genere urgencia apropiada
- Ofrezca valor claro

Genera una estrategia de venta en formato JSON.`,

      mirror: `Eres un asistente de ventas conversacional. Genera una respuesta natural y personalizada basada en:
- El perfil del cliente
- La estrategia de venta
- El contexto de la conversación

Responde de forma amigable, profesional y persuasiva. Máximo 2-3 párrafos.`,
    }
  }
}

export const workflowTemplate = new WorkflowTemplateManager()
