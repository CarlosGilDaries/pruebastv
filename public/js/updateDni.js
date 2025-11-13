import { validateUserForm } from "./modules/validateUserForm.js";
import { dropDownTypeMenu } from "./modules/dropDownTypeMenu.js";
import { showPassword } from "./modules/showPasword.js";
import { clickLogOut } from './modules/clickLogOutButton.js';

const gendersDropDown = document.getElementById('genders');
const categoriesDropDown = document.getElementById('categories');

dropDownTypeMenu(categoriesDropDown, 'categories', 'category');
dropDownTypeMenu(gendersDropDown, 'genders', 'gender');
clickLogOut();

async function editUserForm() {
    const token = localStorage.getItem('auth_token');
    const backendAPI = '/api/';

    const userResponse = await fetch('/api/user', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const userData = await userResponse.json();
    const id = userData.data.user.id;
    
  loadUserData(id);

  document
    .getElementById('form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();
      document.getElementById('loading').style.display = 'block';

      // Validar antes de enviar
      const validatedForm = await validateUserForm();
      if (!validatedForm) {
        document.getElementById('loading').style.display = 'none';
        return;
      }

      const formData = new FormData();

      if (document.getElementById('dni')) {
        formData.append('dni', document.getElementById('dni').value);
      }

      if (document.getElementById('address')) {
        formData.append('address', document.getElementById('address').value);
        formData.append('city', document.getElementById('city').value);
        formData.append('country', document.getElementById('country').value);
      }

      formData.append('password', document.getElementById('password').value);

      formData.append(
        'password_confirmation',
        document.getElementById('password-confirmation').value
      );
      try {
        const editResponse = await fetch(
          backendAPI + `current-user-edit`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const data = await editResponse.json();

        if (data.success) {
          window.history.back();
          return;
        } else if (!data.success && editResponse.status == 401) {
              const errorElement = document.getElementById('form-error');
              errorElement.classList.remove('d-none');

              setTimeout(() => {
                errorElement.classList.add('d-none');
              }, 2500);
        } else {
          console.error('Error al editar:', data.errors);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        document.getElementById('loading').style.display = 'none';
      }
    });

  async function loadUserData(id) {
    try {
      const response = await fetch(backendAPI + `user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      const user = result.data.user;
      
        if (document.getElementById('address')) {
                      document.getElementById('address').value =
                        user.address || '';
                      document.getElementById('city').value = user.city || '';
                      document.getElementById('country').value =
                        user.country || '';
        }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
    }
  }
}

editUserForm();

const passwordIcon = document.getElementById('toggle-password');
const ionEyeIcon = document.getElementById('eye-icon');
const passwordInput = document.getElementById('password');
const passwordIcon2 = document.getElementById('toggle-password-2');
const ionEyeIcon2 = document.getElementById('eye-icon-2');
const confirmationPasswordInput = document.getElementById(
  'password-confirmation'
);
const passwordIcon3 = document.getElementById('toggle-password-3');
const ionEyeIcon3 = document.getElementById('eye-icon-3');
const newPasswordInput = document.getElementById('new-password');
const passwordIcon4 = document.getElementById('toggle-password-4');
const ionEyeIcon4 = document.getElementById('eye-icon-4');
const confirmationNewPasswordInput = document.getElementById(
  'new-password-confirmation'
);

if (passwordIcon) {
  passwordIcon.addEventListener('click', (event) => {
    showPassword(event, passwordInput, ionEyeIcon);
  });
}
if (passwordIcon2) {
  passwordIcon2.addEventListener('click', (event) => {
    showPassword(event, confirmationPasswordInput, ionEyeIcon2);
  });
}
if (passwordIcon3) {
  passwordIcon3.addEventListener('click', (event) => {
    showPassword(event, newPasswordInput, ionEyeIcon3);
  });
}
if (passwordIcon4) {
  passwordIcon4.addEventListener('click', (event) => {
    showPassword(event, confirmationNewPasswordInput, ionEyeIcon4);
  });
}

