import { validateUserForm } from "./modules/validateUserForm.js";
import { dropDownTypeMenu } from "./modules/dropDownTypeMenu.js";

const gendersDropDown = document.getElementById('genders');
const categoriesDropDown = document.getElementById('categories');

dropDownTypeMenu(categoriesDropDown, 'categories', 'category');
dropDownTypeMenu(gendersDropDown, 'genders', 'gender');

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

      if (document.getElementById('email')) {
        formData.append('email', document.getElementById('email').value);
      }

      if (document.getElementById('address')) {
        formData.append('address', document.getElementById('address').value);
        formData.append('city', document.getElementById('city').value);
        formData.append('country', document.getElementById('country').value);
      }

      if (document.getElementById('phone')) {
        formData.append('phone', document.getElementById('phone').value);
        formData.append('phone_code', document.getElementById('country-code').value);
      }
      if (document.getElementById('new-password')) {
        formData.append(
          'new_password',
          document.getElementById('new-password').value
        );
        formData.append(
          'new_password_confirmation',
          document.getElementById('new-password-confirmation').value
        );
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
          window.location.href = '/account';
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

      const rolsResponse = await fetch('/api/roles', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      const user = result.data.user;
      const plans = result.data.plans;
      const rolesData = await rolsResponse.json();
      const roles = rolesData.roles;

        if (document.getElementById('email')) {
            document.getElementById('email').value = user.email || '';
      }

        if (document.getElementById('address')) {
                      document.getElementById('address').value =
                        user.address || '';
                      document.getElementById('city').value = user.city || '';
                      document.getElementById('country').value =
                        user.country || '';
        }

        if (document.getElementById('phone')) {
          document.getElementById('phone').value = user.phone || '';
          document.getElementById('country-code').value = user.phone_code || '';
        }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
    }
  }
}

editUserForm();
