import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';

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

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.5;
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

const Success = styled.div`
  color: #27ae60;
  margin-bottom: 1rem;
  text-align: center;
  padding: 10px;
  background: #d5f4e6;
  border-radius: 5px;
  border: 1px solid #27ae60;
`;

const Error = styled.div`
  color: #e74c3c;
  margin-bottom: 1rem;
  text-align: center;
  padding: 10px;
  background: #fdf2f2;
  border-radius: 5px;
  border: 1px solid #e74c3c;
`;

const LinkStyled = styled(Link)`
  color: #667eea;
  text-decoration: none;
  display: block;
  text-align: center;
  margin-top: 1rem;

  &:hover {
    text-decoration: underline;
  }
`;

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setMessage('If an account with that email exists, a password reset link has been sent.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Title>Forgot Password</Title>
        <Subtitle>
          Enter your email address and we'll send you a link to reset your password.
        </Subtitle>
        
        {message && <Success>{message}</Success>}
        {error && <Error>{error}</Error>}
        
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>
        
        <LinkStyled to="/login">
          Back to Login
        </LinkStyled>
      </Form>
    </Container>
  );
};

export default ForgotPassword;
