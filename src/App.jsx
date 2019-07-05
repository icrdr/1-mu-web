import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import MainPage from './pages/MainPage'
import FilePage from './pages/FilePage'
import './App.css';

function App() {
  return (
      <Router>
        <Route exact path="/" component={FilePage} />
        <Route path="/login" component={LoginPage} />
      </Router>
  );
}

export default App;
