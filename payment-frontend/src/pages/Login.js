import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; 

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

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 25px #32cd32;
  }
`;

const ErrorMessage = styled.p`
  color: #ff4d4d;
  text-align: center;
  font-size: 0.9rem;
  margin-top: 15px;
`;

const Subtext = styled.p`
  text-align: center;
  margin-top: 20px;
  color: #aaa;
  font-size: 0.9rem;

  a {
    color: #32cd32;
    text-decoration: none;
    font-weight: bold;

    &:hover {
      text-decoration: underline;
    }
  }
`;

// --- The Main Login Component ---
export default function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        email,
        password,
      });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token); // Persist token
      navigate('/dashboard'); // Redirect to dashboard on successful login
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Login failed. Please try again.');
      }
      console.error('Login error:', err);
    }
  };

  return (
    <PageContainer>
      <FormContainer onSubmit={handleSubmit}>
        <Title>Welcome Back</Title>
        <InputGroup>
          <Label htmlFor="email">Email Address</Label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </InputGroup>
        <InputGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </InputGroup>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <GreenButton type="submit">Login</GreenButton>
        <Subtext>
          Don't have an account? <Link to="/register">Create one</Link>
        </Subtext>
      </FormContainer>
    </PageContainer>
  );
}
