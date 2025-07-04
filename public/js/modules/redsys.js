export async function processRedsysPayment(redsysData) {
  try {
    // Crear formulario oculto
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://sis-t.redsys.es:25443/sis/realizarPago'; // URL de prueba

    // Agregar campos requeridos
    const addHiddenField = (name, value) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    // Campos básicos de Redsys
    addHiddenField('Ds_SignatureVersion', 'HMAC_SHA256_V1');
    addHiddenField('Ds_MerchantParameters', redsysData.Ds_MerchantParameters);
    addHiddenField('Ds_Signature', redsysData.Ds_Signature);

    // Agregar formulario al DOM y enviar
    document.body.appendChild(form);
    form.submit();
  } catch (error) {
    console.error('Error al procesar pago:', error);
  }
}