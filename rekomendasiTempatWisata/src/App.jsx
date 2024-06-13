import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

const App = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [rating, setRating] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // Load local CSV file using PapaParse
    fetch('./assets/tourism_with_id.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            setItems(results.data);
          }
        });
      })
      .catch(error => {
        console.error('Error loading CSV data:', error);
      });
  }, []);

  const handleSelectChange = (event) => {
    console.log(event.target.value);
    setSelectedItem(event.target.value);
  };

  const handleRatingChange = (event) => {
    setRating(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Send data to Flask API
    axios.post('http://127.0.0.1:5000/predict', {
      Item: parseFloat(selectedItem),
      Rating: parseFloat(rating)
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
      .then(response => {
        const data = JSON.parse(response.data.replace(/NaN/g, 'null')); // Replace NaN with null and parse JSON
        setRecommendations(data);
      })
      .catch(error => {
        console.error('Error sending prediction request:', error);
      });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Recommender System</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex mb-4">
          <label htmlFor="item-select" className="mr-4">
            Select Item:
          </label>
          <select
            id="item-select"
            value={selectedItem}
            onChange={handleSelectChange}
            className="border rounded-md p-2"
          >
            <option value="" disabled>Select an item</option>
            {items.map(item => 
            {
              // console.log(item);
            return (
              <option key={item.id} value={item.Place_Id}>{item.Place_Name}</option>
            )})}
          </select>
        </div>
        <div className="flex mb-4">
          <label htmlFor="rating-input" className="mr-4">
            Rating:
          </label>
          <input
            id="rating-input"
            type="number"
            value={rating}
            onChange={handleRatingChange}
            step="0.1"
            min="0"
            max="5"
            className="border rounded-md p-2"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">Submit</button>
      </form>
      
      {recommendations && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Prediction Result</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(recommendations).map(id => (
              <div key={id} className="border rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-2">{recommendations[id].detail.Place_Name}</h2>
                <p className="text-gray-600 mb-2">{recommendations[id].detail.Description}</p>
                <p className="text-gray-800 mb-2">Category: {recommendations[id].detail.Category}</p>
                <p className="text-gray-800 mb-2">City: {recommendations[id].detail.City}</p>
                <p className="text-gray-800 mb-2">Rating: {recommendations[id].detail.Rating}</p>
                <p className="text-gray-800 mb-2">Price: {recommendations[id].detail.Price}</p>
                <p className="text-gray-800 mb-2">Probability: {recommendations[id].probability}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
