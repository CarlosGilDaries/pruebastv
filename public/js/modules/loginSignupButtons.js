export function setupLoginSignupButtons() {
    const token = localStorage.getItem('auth_token');
    const userIcon = document.querySelector('.user');
    const navRight = document.querySelector('.right-nav');
    if (token == null) {
      if (userIcon) userIcon.remove();

      const loginButtonContainer = document.createElement('li');
      const signButtonContainer = document.createElement('li');
      loginButtonContainer.classList.add('nav-item');
      signButtonContainer.classList.add('nav-item');
      const loginButton = document.createElement('a');
      loginButton.href = '/login';
      const registerButton = document.createElement('a');
      registerButton.href = '/planes';
      loginButton.innerHTML = `<button class="login-btn nav-link" data-i18n="login">Iniciar sesión</button>`;
      registerButton.innerHTML = `<button class="signup-btn nav-link" data-i18n="register">Registrarse</button>`;
      loginButtonContainer.appendChild(loginButton);
      signButtonContainer.appendChild(registerButton);
      navRight.appendChild(loginButtonContainer);
      navRight.appendChild(signButtonContainer);
    }
}