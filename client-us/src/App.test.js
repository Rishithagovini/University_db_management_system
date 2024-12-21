// Developer: Anjana Priya Bachina and Nikhitha Dadi
//Last Modified: 29-11-2024
// Import necessary utilities from React Testing Library and the App component
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
