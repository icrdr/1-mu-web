import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import MePage from './pages/MePage'
// import MainPage from './pages/MainPage'
import FilePage from './pages/FilePage'
import './App.css';

function App() {
  return (
      <Router>
        <Route exact path="/" component={FilePage} />
        <Route path="/me" component={MePage} />
      </Router>
  );
}

export default App;
