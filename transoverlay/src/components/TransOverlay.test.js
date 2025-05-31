import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TransOverlay from './TransOverlay';

// Mocking the react-rnd functionality
jest.mock('react-rnd', () => {
  return {
    Rnd: ({ children }) => {
      return (
        <div data-testid="rnd-wrapper">
          {children}
        </div>
      );
    }
  };
});

// Mock franc-min
jest.mock('franc-min', () => {
  return {
    franc: jest.fn().mockImplementation((text) => {
      // Simple mock implementation
      if (text.includes('hello')) return 'eng';
      if (text.includes('hola')) return 'spa';
      if (text.includes('bonjour')) return 'fra';
      return 'eng'; // Default to English
    })
  };
});

// Mock document.elementsFromPoint
document.elementsFromPoint = jest.fn().mockReturnValue([]);

describe('TransOverlay Component', () => {
  test('renders the TransOverlay component', () => {
    render(<TransOverlay />);
    const headerElement = screen.getByText(/TransOverlay/i);
    expect(headerElement).toBeInTheDocument();
  });

  test('language selector contains options', () => {
    render(<TransOverlay />);
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
    
    // Check if Spanish is the default selected option
    expect(selectElement.value).toBe('es');
  });

  test('text area for input exists when not in hover mode', () => {
    render(<TransOverlay />);
    const textareaElement = screen.getByPlaceholderText(/Type or drop text here/i);
    expect(textareaElement).toBeInTheDocument();
  });

  test('input text triggers translation', () => {
    render(<TransOverlay />);
    const textareaElement = screen.getByPlaceholderText(/Type or drop text here/i);
    
    // Simulate typing in the textarea
    fireEvent.change(textareaElement, { target: { value: 'Hello world' } });
    
    // Check if the translation panel appears
    const translationPanel = screen.getByText(/Hello world/i);
    expect(translationPanel).toBeInTheDocument();
  });

  test('clear button clears the input text', () => {
    render(<TransOverlay />);
    const textareaElement = screen.getByPlaceholderText(/Type or drop text here/i);
    
    // Add some text first
    fireEvent.change(textareaElement, { target: { value: 'Hello world' } });
    
    // Click the clear button
    const clearButton = screen.getByText(/Clear/i);
    fireEvent.click(clearButton);
    
    // Check if the textarea is empty now
    expect(textareaElement.value).toBe('');
  });

  test('hover mode toggle button works', () => {
    render(<TransOverlay />);
    
    // Find the hover toggle button
    const hoverButton = screen.getByText(/Hover: Off/i);
    expect(hoverButton).toBeInTheDocument();
    
    // Click the hover button
    fireEvent.click(hoverButton);
    
    // Check if hover mode is activated
    const hoverActiveButton = screen.getByText(/Hover: On/i);
    expect(hoverActiveButton).toBeInTheDocument();
    
    // In hover mode, textarea should not be visible
    expect(screen.queryByPlaceholderText(/Type or drop text here/i)).not.toBeInTheDocument();
  });

  test('lock button works', () => {
    render(<TransOverlay />);
    
    // Find the lock button
    const lockButton = screen.getByText(/Lock/i);
    expect(lockButton).toBeInTheDocument();
    
    // Click the lock button
    fireEvent.click(lockButton);
    
    // Check if it changes to unlock
    const unlockButton = screen.getByText(/Unlock/i);
    expect(unlockButton).toBeInTheDocument();
  });
});
