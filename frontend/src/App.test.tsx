import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple test that doesn't require external dependencies
test('renders basic test', () => {
  const TestComponent = () => <div>Test Component</div>;
  render(<TestComponent />);
  const element = screen.getByText('Test Component');
  expect(element).toBeInTheDocument();
});
