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
                // Solo mostrar los campos que están en fieldsToDisplay
                const row = tableBody.insertRow();
                const cell1 = row.insertCell(0);
                const cell2 = row.insertCell(1);

                // Asignar el nombre de la columna en español
                cell1.textContent = fieldsToDisplay[key];
                if (
                  value == 'man' ||
                  value == 'woman' ||
                  value == 'non-binary' ||
                  value == 'others'
                ) {
                  if (value == 'man') {
                    cell2.textContent = 'Hombre';
                  } else if (value == 'woman') {
                    cell2.textContent = 'Mujer';
                  } else if (value == 'non-binary') {
                    cell2.textContent = 'No binario';
                  } else {
                    cell2.textContent = 'Sin especificar';
                  }
                } else {
                  cell2.textContent = value;
                }
              }
            }
          }

          const plan = data.data.plan;
          if (plan != null) {
            const planRow = document.createElement('tr');
            const planKey = document.createElement('td');
            planKey.innerHTML = 'Plan';
            const planValue = document.createElement('td');
            planValue.innerHTML = plan.name;
            tableBody.appendChild(planRow);
            planRow.appendChild(planKey);
            planRow.appendChild(planValue);
          }
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

document
  .getElementById('logout-button')
  .addEventListener('click', async function (event) {
    event.preventDefault();

    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('No se encontró el token de autenticación');
      return;
    }

    logOut(token);
  });
