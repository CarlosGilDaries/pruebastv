document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('register-form');
  const steps = document.querySelectorAll('.form-step');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const submitBtn = document.querySelector('.submit-btn');
  let currentStep = 0;

  // Inicializar pasos
  function showStep(step) {
    steps.forEach((s, index) => {
      s.classList.remove('active', 'next', 'prev');
      if (index === step) {
        s.classList.add('active');
      } else if (index > step) {
        s.classList.add('next');
      } else {
        s.classList.add('prev');
      }
    });

    // Actualizar botones de navegación
    prevBtn.disabled = step === 0;
    nextBtn.style.display = step === steps.length - 1 ? 'none' : 'block';
    submitBtn.style.display = step === steps.length - 1 ? 'block' : 'none';
  }

  // Validaciones específicas para cada campo
  function validateField(field) {
    const value = field.value.trim();
    const errorElement = field
      .closest('.input-box')
      .querySelector('.error-message');

    // Limpiar errores previos
    if (errorElement) {
      errorElement.textContent = '';
      field.style.border = '';
    }

    // Validaciones por tipo de campo
    switch (field.id) {
      case 'name':
        if (!value) {
          showError(field, 'El nombre es obligatorio');
          return false;
        }
        if (value.length > 50) {
          showError(field, 'No puede exceder los 50 caracteres');
          return false;
        }
        break;

      case 'surnames':
        if (!value) {
          showError(field, 'Los apellidos son obligatorios');
          return false;
        }
        if (value.length > 100) {
          showError(field, 'No puede exceder los 100 caracteres');
          return false;
        }
        break;

      case 'email':
        if (!value) {
          showError(field, 'El email es obligatorio');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          showError(field, 'Por favor ingresa un email válido');
          return false;
        }
        break;

      case 'dni':
        if (!value) {
          showError(field, 'El dni es obligatorio');
          return false;
        }
        if (!/^(\d{8})([A-Za-z])$/.test(value)) {
          showError(field, 'Por favor ingresa un DNI válido');
          return false;
        }
        const numero = parseInt(match[1], 10);
        const letraIngresada = match[2].toUpperCase();
        const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
        const letraCorrecta = letras[numero % 23];

        if (letraIngresada !== letraCorrecta) {
          showError(field, `Por favor ingresa un DNI válido.`);
          return false;
        }
        break;

      case 'address':
        if (!value) {
          showError(field, 'La dirección es obligatoria.');
          return false;
        }
        if (value.length > 200) {
          showError(field, 'No puede exceder los 200 caracteres');
          return false;
        }
        break;

      case 'city':
        if (!value) {
          showError(field, 'La ciudad es obligatoria.');
          return false;
        }
        if (value.length > 50) {
          showError(field, 'No puede exceder los 50 caracteres');
          return false;
        }
        break;

      case 'country':
        if (!value) {
          showError(field, 'El país es obligatorio.');
          return false;
        }
        if (value.length > 50) {
          showError(field, 'No puede exceder los 50 caracteres');
          return false;
        }
        break;

      case 'birth-year':
        if (!value) {
          showError(field, 'El año es obligatorio.');
          return false;
        }
        if (!/^\d{1,4}$/.test(value)) {
          showError(field, 'Por favor ingresa un año válido');
          return false;
        }
        const year = parseInt(value, 10);
        const currentYear = new Date().getFullYear();

        if (year < 1950) {
          showError(field, 'Por favor ingresa un año válido.');
          return false;
        }

        if (year > currentYear) {
          showError(field, 'Por favor ingresa un año válido.');
          return false;
        }
        break;
      case 'gender':
        if (!value) {
          showError(field, 'El género es obligatorio.');
          return false;
        }
        break;
      case 'password':
        if (!value) {
          showError(field, 'La contraseña es obligatoria.');
          return false;
        }
        if (value.length < 6) {
          showError(field, 'Mínimo 6 carateres.');
          return false;
        }
        break;
      case 'password_confirmation':
        if (!value) {
          showError(field, 'La confirmación es obligatoria.');
          return false;
        }
        if (value.length < 6) {
          showError(field, 'Mínimo 6 carateres.');
          return false;
        }
        break;
    }

    return true;
  }

  // Mostrar mensaje de error
  function showError(field, message) {
    const errorElement = field
      .closest('.input-box')
      .querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = message;
    }
    field.style.border = '2px solid red';
    return false;
  }

  // Validar todos los campos del paso actual
  function validateCurrentStep() {
    const currentFields = steps[currentStep].querySelectorAll(
      'input[required], select[required], input:not([type="file"]), select, input[type="file"]'
    );

    let isValid = true;

    currentFields.forEach((field) => {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  // Siguiente paso con validación
  nextBtn.addEventListener('click', function () {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
      }
    }
  });

  // Paso anterior
  prevBtn.addEventListener('click', function () {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  });

  // Validación en tiempo real para campos
  steps.forEach((step) => {
    step.querySelectorAll('input, select').forEach((input) => {
      input.addEventListener('blur', function () {
        validateField(this);
      });

      input.addEventListener('focus', function () {
        const errorElement =
          this.closest('.input-box').querySelector('.error-message');
        if (errorElement) {
          errorElement.textContent = '';
        }
        this.style.border = '';
      });
    });
  });

  // Inicializar
  showStep(0);
});
