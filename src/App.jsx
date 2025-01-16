import React from 'react';
    import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
    import Auth from './components/Auth';
    import DataInput from './components/DataInput';
    import AdviceDisplay from './components/AdviceDisplay';
    function App() {
      return (
        <Router>
          <div className="container">
            <Routes>
              <Route path="/" element={<Auth />} />
              <Route path="/input" element={<DataInput />} />
              <Route path="/advice/:financialDataId" element={<AdviceDisplay />} />
            </Routes>
          </div>
        </Router>
      );
    }
    export default App;
