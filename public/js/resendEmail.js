const token = localStorage.getItem('auth_token');

document
  .getElementById('resendVerification')
  .addEventListener('click', async function () {
    const button = this;
    const messageElement = document.getElementById('resendMessage');

    button.disabled = true;
    button.textContent = 'Enviando...';

    try {
      const response = await fetch('/api/email/verification-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        messageElement.textContent =
          '¡Email de verificación enviado! Revisa tu bandeja de entrada.';
        messageElement.style.display = 'block';
        button.textContent = 'Reenviado';
      } else {
        throw new Error(data.message || 'Error al reenviar el email');
      }
    } catch (error) {
      messageElement.textContent = error.message;
      messageElement.style.color = 'red';
      messageElement.style.display = 'block';
      button.textContent = 'Reenviar';
      button.disabled = false;
    }
  });
