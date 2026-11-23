
const GRAPH_VERSION = "v23.0";

function formatPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");

  if (!/^\d{10,15}$/.test(digits)) {
    throw new Error("Número de WhatsApp inválido");
  }

  return digits;
}

export async function enviarWhatsApp({
  telefone,
  template,
  parametros = [],
  idioma = "pt_BR",
}) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    throw new Error("Credenciais do WhatsApp não configuradas");
  }

  if (!template || !/^[a-z0-9_]+$/.test(template)) {
    throw new Error("Nome de template inválido");
  }

  const components = parametros.length
    ? [{
        type: "body",
        parameters: parametros.map((valor) => ({
          type: "text",
          text: String(valor),
        })),
      }]
    : [];

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${phoneId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: formatPhone(telefone),
        type: "template",
        template: {
          name: template,
          language: { code: idioma },
          ...(components.length ? { components } : {}),
        },
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    console.error("Falha no envio WhatsApp", {
      status: response.status,
      code: result.error?.code,
    });
    throw new Error("Falha na API do WhatsApp");
  }

  return {
    messageId: result.messages?.[0]?.id || null,
    status: "accepted",
  };
}
