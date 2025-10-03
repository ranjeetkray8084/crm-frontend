import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './shared/contexts/AuthContext';
import { NotesProvider } from './shared/contexts/NotesContext';
import WebApp from './platforms/web/WebApp';

function App() {
  return (
    <AuthProvider>
      <NotesProvider>
        <Router>
          <div className="App">
            <WebApp />
            
          </div>
        </Router>
      </NotesProvider>
    </AuthProvider>
  );
}

export default App;