import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Form = styled.form`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  box-sizing: border-box;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 1rem;

  &:hover {
    background: #5a6fd8;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Error = styled.div`
  color: #e74c3c;
  margin-bottom: 1rem;
  text-align: center;
`;

const Success = styled.div`
  color: #27ae60;
  margin-bottom: 1rem;
  text-align: center;
  padding: 10px;
  background: #d5f4e6;
  border-radius: 5px;
  border: 1px solid #27ae60;
`;

const LinkStyled = styled(Link)`
  color: #667eea;
  text-decoration: none;
  cursor: pointer;
  display: block;
  text-align: center;
  margin-top: 0.5rem;

  &:hover {
    text-decoration: underline;
  }
`;

const ToggleLink = styled.a`
  color: #667eea;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignup) {
        const response = await signup(email, password, firstName, lastName);
        setMessage(response.message || 'Account created successfully! Please check your email to verify your account.');
        // Clear form after successful signup
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setIsSignup(false);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Title>{isSignup ? 'Sign Up' : 'Login'}</Title>
        
        {message && <Success>{message}</Success>}
        {error && <Error>{error}</Error>}
        
        {isSignup && (
          <>
            <Input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="Last Name (optional)"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </>
        )}
        
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : (isSignup ? 'Sign Up' : 'Login')}
        </Button>
        
        {!isSignup && (
          <LinkStyled to="/forgot-password">
            Forgot your password?
          </LinkStyled>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <ToggleLink onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
          </ToggleLink>
        </div>
      </Form>
    </Container>
  );
};

export default Login;
