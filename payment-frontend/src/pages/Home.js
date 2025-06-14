import React, { useState, useEffect } from 'react'; // Imported useState and useEffect
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';

// --- STYLES (Your existing styles are preserved) ---

const floating = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #0d0d0d;
  color: #fff;
  font-family: 'Poppins', sans-serif;
  overflow: hidden;
  padding: 20px;
`;

const AppLogo = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: #32cd32;
  text-shadow: 0 0 15px rgba(50, 205, 50, 0.6);
  margin: 0;
  margin-bottom: 40px;
  letter-spacing: 2px;
`;

const FloatingCard = styled.div`
  width: 350px;
  height: 220px;
  background: linear-gradient(45deg, #222, #444);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  animation: ${floating} 4s ease-in-out infinite;
  border-top: 2px solid silver;
  border-right: 2px solid silver;
`;

const CardChip = styled.div`
  width: 50px;
  height: 40px;
  background: #ffdf00;
  border-radius: 5px;
`;

const CardNumber = styled.p`
  font-family: 'Roboto Mono', monospace;
  font-size: 1.5rem;
  letter-spacing: 3px;
  color: #eee;
  margin: 0;
`;

const CardHolder = styled.p`
  font-size: 0.9rem;
  color: #ccc;
  text-transform: uppercase;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  margin-top: 40px;
  margin-bottom: 10px;
  color: #fff;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #aaa;
  margin-bottom: 30px;
  text-align: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
`;

const GreenButton = styled.button`
  padding: 12px 28px;
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
  background-color: #32cd32;
  border: none;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

// --- NEW COMPONENT FOR YOUR NAME ---
const FooterText = styled.p`
  position: absolute;
  bottom: 20px;
  font-size: 1.3rem;
  color: #444; /* Subtle color */
`;


// --- The Main Component ---
export default function Home() {
  const navigate = useNavigate();

  // --- DYNAMIC CONTENT LOGIC ---
  const [cardDetails, setCardDetails] = useState({
    name: 'NAMAN SHARMA',
    number: 'XXXX XXXX XXXX 3737',
  });

  // This `useEffect` hook runs once when the component mounts
  useEffect(() => {
    const sampleNames = ['NAMAN SHARMA', 'JANE DOE', 'ALEX RAY', 'CHRIS CODE'];
    let nameIndex = 0;

    // Set an interval to update the card details every 3 seconds
    const intervalId = setInterval(() => {
      nameIndex = (nameIndex + 1) % sampleNames.length;
      const newNumber = `XXXX XXXX XXXX ${Math.floor(1000 + Math.random() * 9000)}`;
      
      setCardDetails({
        name: sampleNames[nameIndex],
        number: newNumber,
      });
    }, 3000);

    // Cleanup function: this stops the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this effect runs only once on mount

  return (
    <HomeContainer>
      <AppLogo>GitPAY</AppLogo>

      <FloatingCard>
        <CardChip />
        <div>
          {/* Use the dynamic state values here */}
          <CardNumber>{cardDetails.number}</CardNumber>
          <CardHolder>{cardDetails.name}</CardHolder>
        </div>
      </FloatingCard>

      <Title>Secure Payments, Reimagined.</Title>
      <Subtitle>Join the future of finance. Fast, secure, and stylish.</Subtitle>
      
      <ButtonContainer>
        <GreenButton onClick={() => navigate('/login')}>Login</GreenButton>
        <GreenButton onClick={() => navigate('/register')} style={{ background: '#222', border: '2px solid #32cd32' }}>
          Create Account
        </GreenButton>
      </ButtonContainer>

      {/* Your name added here */}
      <FooterText><b>Made by Naman Sharma</b></FooterText>
    </HomeContainer>
  );
}
