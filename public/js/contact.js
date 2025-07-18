document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form');
  const loading = document.getElementById('loading');
  const successMessage = document.getElementById('success-message');

  loading.style.display = 'none';
  successMessage.style.display = 'none';

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('line').value;

    let isValid = true;

    // Reset errores
    document
      .querySelectorAll('.error-message')
      .forEach((el) => (el.textContent = ''));

    if (!email) {
      document.getElementById('email-error').textContent =
        'El email es requerido';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      document.getElementById('email-error').textContent = 'Introduce un email válido.';
      isValid = false;
    }

    if (!subject) {
      document.getElementById('subject-error').textContent =
        'El asunto es requerido';
      isValid = false;
    }

    if (!message) {
      document.getElementById('line-error').textContent =
        'El mensaje es requerido';
      isValid = false;
    }

    if (!isValid) return;

    loading.style.display = 'flex';

    try {
      const response = await fetch('/api/send-contact-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: email,
          subject: subject,
          message: message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        successMessage.style.display = 'block';
        form.reset();

        setTimeout(() => {
          successMessage.style.display = 'none';
        }, 5000);
      } else {
        alert('Hubo un error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      loading.style.display = 'none';
    }
  });
});
