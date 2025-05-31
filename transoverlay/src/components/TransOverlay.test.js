import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TransOverlay from './TransOverlay';

// Mocking the react-draggable functionality
jest.mock('react-draggable', () => {
  return ({ children, handle, onStart, onStop }) => {
    return (
      <div data-testid="draggable-wrapper">
        {children}
      </div>
    );
  };
});

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

  test('text area for input exists', () => {
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
    
    // Check if the translated text appears (our mock translation)
    expect(screen.getByText(/\[es\] Hello world \(translated\)/i)).toBeInTheDocument();
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
});
