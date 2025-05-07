import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './styles/main.css';

function PaymentModal({ isOpen, onClose, onSubmit, quote }) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const formatKES = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const validateMpesaNumber = (number) => {
        // Remove any spaces or special characters
        const cleanNumber = number.replace(/[\s\-\(\)]/g, '');
        
        // Check if number starts with +254 or 0
        if (!cleanNumber.match(/^(\+254|0)/)) {
            return {
                isValid: false,
                message: 'Number must start with +254 or 0'
            };
        }

        // Convert to standard format for validation
        let standardNumber = cleanNumber;
        if (cleanNumber.startsWith('0')) {
            standardNumber = '+254' + cleanNumber.substring(1);
        }

        // Validate M-PESA number format
        if (!standardNumber.match(/^\+2547\d{8}$/)) {
            return {
                isValid: false,
                message: 'Please enter a valid Safaricom M-PESA number'
            };
        }

        return {
            isValid: true,
            number: standardNumber
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validation = validateMpesaNumber(phoneNumber);
        if (!validation.isValid) {
            setError(validation.message);
            return;
        }

        setIsLoading(true);
        try {
            // Simulate M-PESA API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show M-PESA prompt message
            alert(
                `M-PESA Payment Request\n\n` +
                `To: ${validation.number}\n` +
                `Amount: ${formatKES(quote)}\n\n` +
                `Please check your phone for the M-PESA prompt.\n` +
                `Enter your M-PESA PIN to complete the payment.`
            );
            
            // Navigate to receipt page with payment details
            navigate('/receipt', { 
                state: { 
                    quote, 
                    formData: JSON.parse(localStorage.getItem('quoteData')),
                    paymentDetails: {
                        phoneNumber: validation.number,
                        method: 'M-PESA'
                    }
                } 
            });
        } catch (err) {
            setError('Failed to process M-PESA payment. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>M-PESA Payment</h2>
                <div className="mpesa-info">
                    <p className="payment-amount">Amount to Pay: {formatKES(quote)}</p>
                    <p className="mpesa-instructions">
                        Enter your Safaricom M-PESA number to receive the payment prompt
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                            setPhoneNumber(e.target.value);
                            setError('');
                        }}
                        placeholder="Enter M-PESA number (e.g., 0712345678)"
                        required
                        disabled={isLoading}
                    />
                    {error && <p className="error-message">{error}</p>}
                    <div className="modal-buttons">
                        <button 
                            type="submit" 
                            className="submit-button"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : 'Pay with M-PESA'}
                        </button>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="cancel-button"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ResultsPage() {
    const navigate = useNavigate();     
    const location = useLocation();
    const { quote, formData } = location.state || {};
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const formatKES = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/');
        }, 100000);

        return () => clearTimeout(timer);
    }, [navigate]);

    const handlePayment = (phoneNumber) => {
        // Here you would typically integrate with a payment gateway
        console.log(`Payment processed for ${phoneNumber}`);
        setIsPaymentModalOpen(false);
    };

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
            <h1 style={{ color: "Black" }}>Policy Quote Results</h1>
            <div className="results-content">
                <h2>Quote Summary</h2>
                <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                <p><strong>Age:</strong> {formData.age}</p>
                <p><strong>Insurance Type:</strong> {formData.insuranceType}</p>
                <p><strong>Coverage Level:</strong> {formData.coverageLevel}</p>
                <p className="quote-amount">Estimated Policy Quote: {formatKES(quote)}</p>
                
                <div className="button-group">
                    <button onClick={() => navigate('/')} className="submit-button">
                        <marquee>Welcome to CIC Group</marquee>
                    </button>
                    <button 
                        onClick={() => setIsPaymentModalOpen(true)} 
                        className="submit-button payment-button"
                    >
                        <marquee>Pay with M-PESA</marquee>
                    </button>
                </div>
            </div>
            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSubmit={handlePayment}
                quote={quote}
            />
        </div>
    );
}

function ReceiptPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { quote, formData, paymentDetails } = location.state || {};

    const formatKES = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (!quote || !formData) {
        return (
            <div className="container">
                <h1 style={{ color: "Red" }}>Error</h1>
                <p>No receipt data available.</p>
                <button onClick={() => navigate('/')} className="submit-button">
                    Calculate New Quote
                </button>
            </div>
        );
    }

    return (
        <div className="container">
            <h1 style={{ color: "Black" }}>Payment Receipt</h1>
            <div className="receipt-content">
                <div className="receipt-header">
                    <img src="/images/cicgrouplogo.png" alt="CIC Group Logo" className="logo" />
                    <h2>Payment Confirmation</h2>
                </div>
                
                <div className="receipt-details">
                    <h3>Policy Details</h3>
                    <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                    <p><strong>Age:</strong> {formData.age}</p>
                    <p><strong>Insurance Type:</strong> {formData.insuranceType}</p>
                    <p><strong>Coverage Level:</strong> {formData.coverageLevel}</p>
                    <p className="quote-amount"><strong>Amount Paid:</strong> {formatKES(quote)}</p>
                </div>

                <div className="payment-details">
                    <h3>Payment Information</h3>
                    <p><strong>Payment Method:</strong> M-PESA</p>
                    <p><strong>Phone Number:</strong> {paymentDetails?.phoneNumber}</p>
                    <p><strong>Transaction Date:</strong> {new Date().toLocaleString()}</p>
                    <p><strong>Status:</strong> <span className="status-success">Completed</span></p>
                </div>

                <div className="receipt-footer">
                    <p>Thank you for choosing CIC Group Insurance!</p>
                    <p>A confirmation email has been sent to your registered email address.</p>
                </div>

                <div className="button-group">
                    <button onClick={() => navigate('/')} className="submit-button">
                        Calculate New Quote
                    </button>
                    <button onClick={() => window.print()} className="submit-button">
                        Print Receipt
                    </button>
                </div>
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
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [id]: value
        }));
        setError(''); 
    };

    const calculateQuote = (insuranceType, age, coverageType) => {
        let baseRate;
        let additionalCharge = 0;
        
        if (insuranceType === "auto") {
            baseRate = 75000; // KES 75,000 base rate for auto insurance
        } else if (insuranceType === "health") {
            baseRate = 45000; // KES 45,000 base rate for health insurance
        } else {
            throw new Error("Invalid insurance type");
        }

        if (insuranceType === "auto" && age < 25) {
            additionalCharge += 15000; // KES 15,000 additional for young drivers
        }
        if (coverageType === "premium") {
            additionalCharge += 30000; // KES 30,000 additional for premium coverage
        }

        return baseRate + additionalCharge;
    };

    const formatKES = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.firstName || !formData.lastName || !formData.insuranceType || !formData.age || !formData.coverageLevel) {
            setError("Please fill out all fields.");
            return;
        }

        const age = Number(formData.age);
        if (isNaN(age) || age < 1 || age > 120) {
            setError("Please enter a valid age!");
            return;
        }

        try {
            const quote = calculateQuote(formData.insuranceType, age, formData.coverageLevel);
            
            const quoteData = {
                ...formData,
                age,
                quote
            };
            localStorage.setItem('quoteData', JSON.stringify(quoteData));
            
            navigate('/results', { state: { quote, formData: quoteData } });
        } catch (err) {
            setError("Error calculating quote: " + err.message);
        }
    };

    return (
        <div className="container">
            <h1 style={{ color: "Red" }}>Policy Quote Calculator</h1>
            <img src="/images/cicgrouplogo.png" alt="CIC Group Logo" className="logo" />

            <form onSubmit={handleSubmit}>
                <h2>Fill in the form</h2>
                
                {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
                
                <div className="form-group">
                    <label htmlFor="firstName"></label>
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
                    <label htmlFor="lastName"></label>
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
                    <label htmlFor="age"></label>
                    <input
                        type="number"
                        id="age"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="Enter your Age"
                        min="0"
                        max="120"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="insuranceType"></label>
                    <select
                        id="insuranceType"
                        value={formData.insuranceType}
                        onChange={handleChange}
                    >
                        <option value="auto">Auto Insurance</option>
                        <option value="health">Health Insurance</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="coverageLevel"></label>
                    <select
                        id="coverageLevel"
                        value={formData.coverageLevel}
                        onChange={handleChange}
                    >
                        <option value="basic">Basic Coverage</option>
                        <option value="premium">Premium Coverage</option>
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
                <Route path="/receipt" element={<ReceiptPage />} />
            </Routes>
        </BrowserRouter>
    );
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
