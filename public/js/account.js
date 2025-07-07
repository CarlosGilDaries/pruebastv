import { logOut } from './modules/logOut.js';
import { dropDownTypeMenu } from './modules/dropDownTypeMenu.js';
import { clickLogOut } from './modules/clickLogOutButton.js';

const token = localStorage.getItem('auth_token');
if (token == null) {
  window.location.href = '/login';
}
const button = document.querySelector('.select-plan');
const email = localStorage.getItem('current_user_email');
const device_id = localStorage.getItem('device_id_' + email);
const api = 'https://pruebastv.kmc.es/api/';

if (device_id == null) {
  logOut(token);
}

clickLogOut();

document.addEventListener('DOMContentLoaded', function () {
  const categoriesDropDown = document.getElementById('categories');
  const gendersDropDown = document.getElementById('genders');
dropDownTypeMenu(categoriesDropDown, 'categories', 'category');
dropDownTypeMenu(gendersDropDown, 'genders', 'gender');

  localStorage.removeItem('needed_plans');
  fetch('/api/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.success) {
        const user = data.data.user;

        if (user.rol == 'admin') {
          button.innerHTML = 'Panel de Admin';
        }

        if (user) {
          const tableBody = document
            .getElementById('user-table')
            .getElementsByTagName('tbody')[0];

          // Definir los campos que quieres mostrar
          const fieldsToDisplay = {
            name: 'Nombre',
            surnames: 'Apellidos',
            email: 'Email',
            phone: 'Teléfono',
            address: 'Dirección',
            city: 'Ciudad',
            country: 'País',
            dni: 'DNI/NIF',
            gender: 'Sexo',
          };

          // Filtrar los datos para que solo se muestren los campos relevantes
          for (const [key, value] of Object.entries(user)) {
            // Excluir los campos no deseados
            if (
              !['email_verified_at', 'created_at', 'updated_at'].includes(key)
            ) {
              if (fieldsToDisplay[key]) {
                const row = tableBody.insertRow();
                const cell1 = row.insertCell(0);
                const cell2 = row.insertCell(1);

                cell1.textContent = fieldsToDisplay[key];

                // Manejo especial para el campo de género
                if (value == 'man' || value == 'woman' || value == 'others') {
                  if (value == 'man') {
                    cell2.textContent = 'Hombre';
                  } else if (value == 'woman') {
                    cell2.textContent = 'Mujer';
                  } else {
                    cell2.textContent = 'Sin especificar';
                  }
                } else {
                  cell2.textContent = value;
                }

                // Añadir botón "Cambiar" para campos específicos
                if (
                  ['email', 'address','phone'].includes(key)
                ) {
                  const changeButton = document.createElement('button');
                  changeButton.className = 'change-btn';
                  changeButton.textContent = 'Cambiar';
                  cell2.appendChild(changeButton);
                  if (['email'].includes(key)) {
                    changeButton.addEventListener('click', function () {
                      window.location.href = '/change-email.html'
                    });
                  }
                  if (['address'].includes(key)) {
                    changeButton.addEventListener('click', function () {
                      window.location.href = '/change-address.html';
                    });
                  }
                  if (['phone'].includes(key)) {
                    changeButton.addEventListener('click', function () {
                      window.location.href = '/change-phone.html';
                    });
                  }
                }
              }
            }
          }

          const plan = data.data.plan;
          if (plan != null) {
            if (plan != null) {
              const planRow = document.createElement('tr');
              const planKey = document.createElement('td');
              planKey.innerHTML = 'Plan';
              const planValue = document.createElement('td');

              // Formatear la fecha de expiración
              const expirationDate = new Date(user.plan_expires_at);
              const formattedDate = expirationDate.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              planValue.innerHTML = `<p>${plan.name}</p><p>Caduca: ${formattedDate}</p>`;
              tableBody.appendChild(planRow);
              planRow.appendChild(planKey);
              planRow.appendChild(planValue);
            }
          }

          const passwordRow = tableBody.insertRow();
          const passwordKey = passwordRow.insertCell(0);
          const passwordValue = passwordRow.insertCell(1);

          passwordKey.textContent = 'Contraseña';
          passwordValue.textContent = '••••••••';

          const changePasswordButton = document.createElement('button');
          changePasswordButton.className = 'change-btn';
          changePasswordButton.textContent = 'Cambiar';
          passwordValue.appendChild(changePasswordButton);
          changePasswordButton.addEventListener('click', function () {
            window.location.href = '/change-password.html'
          })
        }

        button.addEventListener('click', function () {
          if (user.rol == 'admin') {
            window.location.href = '/admin/admin-panel.html';
          } else {
            window.location.href = '/plans.html';
          }
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

