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
      if (data.success) {
        const user = data.data.user;

        if (user.rol == 'admin') {
          button.innerHTML = 'Panel de Admin';
        }

        if (user) {
          const tableBody = document
            .getElementById('user-table')
            .getElementsByTagName('tbody')[0];

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

          for (const [key, value] of Object.entries(user)) {
            if (
              !['email_verified_at', 'created_at', 'updated_at'].includes(key)
            ) {
              if (fieldsToDisplay[key]) {
                const row = tableBody.insertRow();
                const cell1 = row.insertCell(0);
                const cell2 = row.insertCell(1);

                cell1.textContent = fieldsToDisplay[key];
                cell1.classList.add('fw-bold');

                // Manejo especial para el campo de género
                if (value == 'man' || value == 'woman' || value == 'others') {
                  cell2.textContent =
                    value == 'man'
                      ? 'Hombre'
                      : value == 'woman'
                      ? 'Mujer'
                      : 'Sin especificar';
                } else {
                  cell2.textContent = value || 'No especificado';
                }

                // Añadir botón "Cambiar" para campos específicos
                if (['email', 'address', 'phone'].includes(key)) {
                  const changeButton = document.createElement('button');
                  changeButton.className = 'btn change-btn ms-2';
                  changeButton.innerHTML =
                    'Cambiar';
                  cell2.classList.add(
                    'd-flex',
                    'justify-content-between',
                    'align-items-center'
                  );

                  const valueContainer = document.createElement('span');
                  valueContainer.textContent = cell2.textContent;
                  cell2.textContent = '';
                  cell2.appendChild(valueContainer);
                  cell2.appendChild(changeButton);

                  changeButton.addEventListener('click', function () {
                    if (key === 'email')
                      window.location.href = '/change-email.html';
                    if (key === 'address')
                      window.location.href = '/change-address.html';
                    if (key === 'phone')
                      window.location.href = '/change-phone.html';
                  });
                }
              }
            }
          }

          const plan = data.data.plan;
          if (plan) {
            const planRow = tableBody.insertRow();
            const planKey = planRow.insertCell(0);
            const planValue = planRow.insertCell(1);

            planKey.textContent = 'Plan';
            planKey.classList.add('fw-bold');

            const expirationDate = new Date(user.plan_expires_at);
            const formattedDate = expirationDate.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            const planInfo = document.createElement('div');
            planInfo.innerHTML = `<div class="fw-bold">${plan.name}</div>`;

            if (plan.trimestral_price != 0) {
              planInfo.innerHTML += `<small class="text-muted">Caduca: ${formattedDate}</small>`;
            }

            planValue.appendChild(planInfo);
          }

          // Contraseña
          const passwordRow = tableBody.insertRow();
          const passwordKey = passwordRow.insertCell(0);
          const passwordValue = passwordRow.insertCell(1);

          passwordKey.textContent = 'Contraseña';
          passwordKey.classList.add('fw-bold');
          passwordValue.textContent = '••••••••';

          const changePasswordButton = document.createElement('button');
          changePasswordButton.className = 'btn change-btn ms-2';
          changePasswordButton.innerHTML =
            'Cambiar';
          passwordValue.classList.add(
            'd-flex',
            'justify-content-between',
            'align-items-center'
          );

          const passwordContainer = document.createElement('span');
          passwordContainer.textContent = passwordValue.textContent;
          passwordValue.textContent = '';
          passwordValue.appendChild(passwordContainer);
          passwordValue.appendChild(changePasswordButton);

          changePasswordButton.addEventListener('click', function () {
            window.location.href = '/change-password.html';
          });
        }

        button.addEventListener('click', function () {
          window.location.href =
            user.rol == 'admin' ? '/admin/admin-panel.html' : '/plans.html';
        });
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
});

