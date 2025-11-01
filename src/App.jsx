import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './shared/contexts/AuthContext';
import { NotesProvider } from './shared/contexts/NotesContext';
import WebApp from './platforms/web/WebApp';

function App() {

  return (
    <Router>
      <AuthProvider>
        <NotesProvider>
          <div className="App">
            <WebApp />
          </div>
        </NotesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;