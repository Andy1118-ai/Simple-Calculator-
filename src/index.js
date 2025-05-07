import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './styles/main.css';

function ResultsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { quote, formData } = location.state || {};

    if (!quote || !formData) {
        return (
            <div className="container">
                <h1 style={{ color: "Red" }}>Error</h1>
                <p>No quote data available. Please calculate a quote first.</p>
                <button onClick={() => navigate('/')} className="submit-button">
                    Calculate Quote
                </button>
            </div>
        );
    }

    return (
        <div className="container">
            <h1 style={{ color: "Red" }}>Policy Quote Results</h1>
            <img src="/images/cicgrouplogo.png" alt="CIC Group Logo" className="logo" />
            
            <div className="results-content">
                <h2>Quote Summary</h2>
                <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                <p><strong>Age:</strong> {formData.age}</p>
                <p><strong>Insurance Type:</strong> {formData.insuranceType}</p>
                <p><strong>Coverage Level:</strong> {formData.coverageLevel}</p>
                <p className="quote-amount">Estimated Policy Quote: ${quote.toFixed(2)} per month</p>
                
                <button onClick={() => navigate('/')} className="submit-button">
                    Calculate Another Quote
                </button>
            </div>
        </div>
    );
}

function PolicyCalculator() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        age: '',
        insuranceType: 'auto',
        coverageLevel: 'basic'
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Calculate policy quote based on form data
        const baseRate = formData.insuranceType === 'auto' ? 100 : 150;
        const ageMultiplier = formData.age < 25 ? 1.5 : 1;
        const coverageMultiplier = formData.coverageLevel === 'premium' ? 1.5 : 1;
        
        const quote = baseRate * ageMultiplier * coverageMultiplier;
        
        // Navigate to results page with the quote and form data
        navigate('/results', { state: { quote, formData } });
    };

    return (
        <div className="container">
            <h1 style={{ color: "Red" }}>Policy Quote Calculator</h1>
            <img src="/images/cicgrouplogo.png" alt="CIC Group Logo" className="logo" />

            <form onSubmit={handleSubmit}>
                <h2>Fill in the form</h2>
                
                <div className="form-group">
                    <label htmlFor="firstName">First Name:</label>
                    <input
                        type="text"
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter First Name"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="lastName">Last Name:</label>
                    <input
                        type="text"
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter Last Name"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="age">Age:</label>
                    <input
                        type="number"
                        id="age"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="Enter your Age"
                        min="18"
                        max="100"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="insuranceType">Type of Insurance:</label>
                    <select
                        id="insuranceType"
                        value={formData.insuranceType}
                        onChange={handleChange}
                    >
                        <option value="auto">Auto</option>
                        <option value="health">Health</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="coverageLevel">Coverage Level:</label>
                    <select
                        id="coverageLevel"
                        value={formData.coverageLevel}
                        onChange={handleChange}
                    >
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                    </select>
                </div>

                <button type="submit" className="submit-button">Calculate Quote</button>
            </form>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<PolicyCalculator />} />
                <Route path="/results" element={<ResultsPage />} />
            </Routes>
        </BrowserRouter>
    );
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
