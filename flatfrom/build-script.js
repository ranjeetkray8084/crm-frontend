const fs = require('fs');
const path = require('path');

// Function to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Function to build the desktop app
function buildDesktopApp() {
  console.log('Building CRM Desktop App...');
  
  const crmFrontendPath = path.join(__dirname, '..');
  const buildPath = path.join(__dirname, 'build');
  const distPath = path.join(__dirname, 'dist');
  
  // Check if CRM frontend build exists
  const crmBuildPath = path.join(crmFrontendPath, 'dist');
  if (!fs.existsSync(crmBuildPath)) {
    console.log('CRM frontend build not found. Building it first...');
    console.log('Please run "npm run build" in the crm-frontend directory first.');
    return;
  }
  
  // Create build directory
  if (fs.existsSync(buildPath)) {
    fs.rmSync(buildPath, { recursive: true });
  }
  fs.mkdirSync(buildPath, { recursive: true });
  
  // Copy CRM frontend build to desktop app build folder
  console.log('Copying CRM frontend build...');
  copyDir(crmBuildPath, buildPath);
  
  console.log('Desktop app build completed!');
  console.log('Build files copied to:', buildPath);
  console.log('You can now run "npm run start" to test the desktop app');
  console.log('Or run "npm run build-win" to create the installer');
}

// Run the build
buildDesktopApp();
