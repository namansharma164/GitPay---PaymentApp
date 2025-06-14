import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft } from 'react-icons/fa';


const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #0d0d0d;
  color: #fff;
  font-family: 'Poppins', sans-serif;
  padding: 20px;
`;

const FormContainer = styled.form`
  background: #1a1a1a;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
  border-top: 2px solid #32cd32;
`;

const Title = styled.h2`
  color: #32cd32;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2rem;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #ccc;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #444;
  border-radius: 5px;
  background: #222;
  color: #fff;
  font-size: 1rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #32cd32;
    box-shadow: 0 0 10px #32cd3250;
  }
`;

const GreenButton = styled.button`
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
  background-color: #32cd32;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  box-shadow: 0 0 15px #32cd3270;
  transition: all 0.3s ease;
  margin-top: 10px;

  &:disabled {
    background-color: #555;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const Message = styled.p`
  text-align: center;
  font-size: 0.9rem;
  margin-top: 15px;
  color: ${props => (props.type === 'error' ? '#ff4d4d' : '#39d353')};
`;

const BackLink = styled.div`
  display: flex;
  align-items: center;
  color: #aaa;
  cursor: pointer;
  margin-bottom: 30px;
  font-size: 0.9rem;
  
  &:hover {
    color: #32cd32;
  }
`;

export default function RequestByForm() {
  const [fromEmail, setFromEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/transactions/request`, 
        { fromEmail, amount: Number(amount) }, 
        config
      );

      setMessageType('success');
      setMessage(response.data.message);
      setFromEmail('');
      setAmount('');
    } catch (err) {
      setMessageType('error');
      setMessage(err.response?.data?.error || 'Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <FormContainer onSubmit={handleSubmit}>
        <BackLink onClick={() => navigate('/add-funds')}>
          <FaArrowLeft style={{ marginRight: '8px' }} />
          Back to Add Funds
        </BackLink>
        <Title>Request from User</Title>
        <InputGroup>
          <Label htmlFor="email">Request from (Their Email)</Label>
          <Input
            type="email"
            id="email"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="payer@example.com"
            required
          />
        </InputGroup>
        <InputGroup>
          <Label htmlFor="amount">Amount (USD)</Label>
          <Input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            min="0.01"
            step="0.01"
          />
        </InputGroup>
        {message && <Message type={messageType}>{message}</Message>}
        <GreenButton type="submit" disabled={loading}>
          {loading ? 'Sending Request...' : 'Send Request'}
        </GreenButton>
      </FormContainer>
    </PageContainer>
  );
}
