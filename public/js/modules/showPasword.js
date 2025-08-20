export function showPassword(event, input, icon) {
  const element = event.currentTarget;

  if (element.getAttribute('data-shown') === 'no') {
    element.setAttribute('data-shown', 'yes');
    input.type = 'text';
    icon.setAttribute('name', 'eye-off-outline');
  } else {
    element.setAttribute('data-shown', 'no');
    input.type = 'password';
    icon.setAttribute('name', 'eye-outline');
  }
}