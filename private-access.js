(() => {
  const loginPanel = document.querySelector('#private-login');
  const managementLink = document.querySelector('#private-management-link');
  const logoutButton = document.querySelector('#private-logout');
  const form = document.querySelector('#private-login-form');
  if (!loginPanel || !managementLink || !logoutButton || !form) return;

  const password = document.querySelector('#private-password');
  const submit = document.querySelector('#private-login-submit');
  const status = document.querySelector('#private-login-status');

  async function api(path, options = {}) {
    const response = await fetch('/api' + path, {
      credentials: 'same-origin',
      ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) }
    });
    let result = {};
    try { result = await response.json(); } catch { /* Keep the HTTP status as the error. */ }
    if (!response.ok) throw new Error(result.error || 'No se pudo completar la solicitud.');
    return result;
  }

  function showAuthenticated() {
    loginPanel.hidden = true;
    managementLink.hidden = false;
    logoutButton.hidden = false;
  }

  function showLogin(message = '') {
    loginPanel.hidden = false;
    managementLink.hidden = true;
    logoutButton.hidden = true;
    status.textContent = message;
    status.classList.remove('error');
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    submit.disabled = true;
    status.textContent = 'Comprobando…';
    status.classList.remove('error');
    try {
      await api('/login', { method: 'POST', body: JSON.stringify({ password: password.value }) });
      password.value = '';
      showAuthenticated();
    } catch (error) {
      status.textContent = error.message;
      status.classList.add('error');
      password.focus();
    } finally {
      submit.disabled = false;
    }
  });

  logoutButton.addEventListener('click', async () => {
    logoutButton.disabled = true;
    try {
      await api('/logout', { method: 'POST' });
      showLogin('Sesión cerrada.');
    } catch (error) {
      status.textContent = error.message;
      status.classList.add('error');
    } finally {
      logoutButton.disabled = false;
    }
  });

  api('/auth').then(showAuthenticated).catch(() => showLogin());
})();
