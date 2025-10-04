// utils/alertUtils.js
let showAlertCallback = null;

export function setAlertCallback(callback) {
  showAlertCallback = callback;
}

// Initialize global overrides immediately
if (typeof window !== 'undefined' && !window.alertOverridden) {
  window.alertOverridden = true;
  
  // Store original functions
  window.originalAlert = window.alert;
  window.originalConfirm = window.confirm;
}

// Custom alert component for centered messages
const showCustomAlert = (message) => {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;

  // Create modal content
  const modal = document.createElement('div');
  modal.style.cssText = `
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    width: 90%;
    text-align: center;
  `;

  // Create message content
  const messageDiv = document.createElement('div');
  messageDiv.style.cssText = `
    color: #374151;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 20px;
    line-height: 1.5;
  `;
  messageDiv.textContent = message;

  // Create OK button
  const button = document.createElement('button');
  button.style.cssText = `
    background: #3B82F6;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  `;
  button.textContent = 'OK';
  button.onmouseover = () => button.style.background = '#2563EB';
  button.onmouseout = () => button.style.background = '#3B82F6';

  // Close function
  const closeModal = () => {
    document.body.removeChild(overlay);
  };

  button.onclick = closeModal;
  overlay.onclick = (e) => {
    if (e.target === overlay) closeModal();
  };

  // Add elements
  modal.appendChild(messageDiv);
  modal.appendChild(button);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
};

export function customAlert(message) {
  if (showAlertCallback) {
    showAlertCallback(message);
  } else {
    showCustomAlert(message); // Use custom centered alert
  }
}

// Override global alert function
if (typeof window !== 'undefined' && window.alertOverridden) {
  window.alert = (message) => {
    showCustomAlert(message);
  };
  
  // Also override confirm for consistency
  window.confirm = (message) => {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      `;

      const modal = document.createElement('div');
      modal.style.cssText = `
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        max-width: 400px;
        width: 90%;
        text-align: center;
      `;

      const messageDiv = document.createElement('div');
      messageDiv.style.cssText = `
        color: #374151;
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 20px;
        line-height: 1.5;
      `;
      messageDiv.textContent = message;

      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = `
        display: flex;
        gap: 12px;
        justify-content: center;
      `;

      const createButton = (text, isPrimary = false) => {
        const button = document.createElement('button');
        button.style.cssText = `
          background: ${isPrimary ? '#3B82F6' : '#6B7280'};
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        `;
        button.textContent = text;
        button.onmouseover = () => button.style.background = isPrimary ? '#2563EB' : '#4B5563';
        button.onmouseout = () => button.style.background = isPrimary ? '#3B82F6' : '#6B7280';
        return button;
      };

      const okButton = createButton('OK', true);
      const cancelButton = createButton('Cancel');

      const closeModal = (result) => {
        document.body.removeChild(overlay);
        resolve(result);
      };

      okButton.onclick = () => closeModal(true);
      cancelButton.onclick = () => closeModal(false);
      overlay.onclick = (e) => {
        if (e.target === overlay) closeModal(false);
      };

      buttonContainer.appendChild(cancelButton);
      buttonContainer.appendChild(okButton);
      modal.appendChild(messageDiv);
      modal.appendChild(buttonContainer);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
    });
  };
}
