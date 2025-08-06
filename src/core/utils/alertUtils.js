// utils/alertUtils.js
let showAlertCallback = null;

export function setAlertCallback(callback) {
  showAlertCallback = callback;
}

export function customAlert(message) {
  if (showAlertCallback) {
    showAlertCallback(message);
  } else {
    alert(message); // fallback
  }
}
