import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store';
import axios from 'axios';

const App: React.FC = () => {
  const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
  const dispatch = useDispatch<AppDispatch>();

  const fetchData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/`);
      console.log('Data:', response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiUrl]);

  return (
      <div className="App">
        <header className="App-header">
          <div>test</div>
          <h1>API URL: {apiUrl}</h1>
        </header>
      </div>
  );
};

export default App;