import { showFormErrors } from "./showFormErrors.js";

export async function validateUserForm() {
  let isValid = true;

  if (document.getElementById('email')) {
    const email = document.getElementById('email').value.trim();
    if (email.length > 100) {
      showFormErrors('email', 'El email no puede exceder los 100 caracteres');
      isValid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFormErrors(
        'email',
        'Introduce un email válido.'
      );
      isValid = false;
    }
    const validEmail = await checkEmailsFromDB(email);
    if (!validEmail) {
      showFormErrors(
        'email',
        'El email ya existe en la Base de Datos.'
      );
      isValid = false;
    }
  }

  if (document.getElementById('address')) {
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const country = document.getElementById('country').value.trim();
    if (address.length > 200) {
      showFormErrors('address', 'No puede exceder los 200 caracteres.');
      isValid = false;
    }
    if (city.length > 50) {
      showFormErrors('city', 'No puede exceder los 50 caracteres');
      isValid = false;
    }
    if (country.length > 50) {
      showFormErrors('country', 'No puede exceder los 50 caracteres');
      isValid = false;
    }
  }

  if (document.getElementById('phone')) {
     const phone = document.getElementById('phone').value.trim();
     if (phone.length > 200) {
       showFormErrors('phone', 'No puede exceder los 15 dígitos.');
       isValid = false;
     }
  }

  if (document.getElementById('password') && document.getElementById('password-confirmation')) {
    const password = document.getElementById('password').value.trim();
    const passwordConfirm = document.getElementById('password-confirmation').value.trim();
    if (password != passwordConfirm) {
      showFormErrors('password', 'Las contraseñas no coinciden.');
      isValid = false;
    } else if (password.length < 6) {
      showFormErrors('password', 'Mínimo 6 caracteres.');
      isValid = false;
    }
  }

  if (document.getElementById('new-password')) {
    const newPass = document.getElementById('new-password').value.trim();
    const newPassConfirm = document.getElementById('new-password-confirmation').value.trim();
    if (newPass != newPassConfirm) {
            showFormErrors(
              'new-password-confirmation',
              'Las contraseñas nuevas no coinciden.'
            );
            showFormErrors('new-password', 'Las contraseñas nuevas no coinciden.');
            isValid = false;
    } else {
      if (newPass.length < 6) {
        showFormErrors('new-password', '6 caracteres como mínimo.');
        isValid = false;
      }
    }
  }

  return isValid;
}

async function checkEmailsFromDB(email) {
  const response = await fetch(`/api/check-email/${email}`);
  const data = await response.json();

  if (data.success) {
    return true;
  } else {
    return false;
  }
}