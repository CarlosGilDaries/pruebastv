import { logOut } from "./logOut.js";

const logOutButton = document.getElementById('logout');
const token = localStorage.getItem('auth_token');

export async function clickLogOut() {
    logOutButton.addEventListener('click', () => logOut(token));
}
