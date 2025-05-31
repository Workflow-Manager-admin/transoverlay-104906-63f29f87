# TransOverlay Component Documentation

## Overview

TransOverlay is a React component that creates a transparent, draggable overlay for real-time text translation. It's designed to be placed over any window or text content to provide instant translation capabilities.

## Features

- **Transparent Overlay**: Semi-transparent background allows viewing content underneath
- **Draggable Interface**: Can be moved anywhere on the screen via the header
- **Resizable**: Drag the bottom-right corner to resize the overlay
- **Real-time Translation**: Updates translations as text changes (currently simulated)
- **Language Selection**: Choose from multiple target languages
- **File Drop Support**: Drag and drop text files for translation

## Component Structure

### TransOverlay.js
The main component that implements the overlay functionality.

### TransOverlay.css
Styling for the TransOverlay component.

## Usage

```jsx
import TransOverlay from './components/TransOverlay';

function App() {
  return (
    <div className="app">
      {/* Your app content */}
      <TransOverlay />
    </div>
  );
}
```

## Props

Currently, the TransOverlay component doesn't accept any props as it's self-contained, but future versions could accept:

- `initialPosition`: Starting position for the overlay
- `initialSize`: Starting size for the overlay
- `defaultLanguage`: Default selected language
- `translationApi`: Function to use for translations

## Implementation Details

### States

- `position`: Current position of the overlay
- `size`: Current size of the overlay
- `resizing`: Whether the overlay is being resized
- `originalText`: The text to be translated
- `translatedText`: The translated version of the text
- `selectedLanguage`: The currently selected target language
- `isDragOver`: Whether a file is being dragged over the drop area

### Key Functions

- `translateText`: Simulates translation (would call an API in a real implementation)
- `handleResize`: Manages the resizing of the overlay
- `handleDragEnd`: Updates position after dragging
- `handleDrop`: Handles file drop operations
- `handleTextChange`: Updates text in the textarea
- `handleLanguageChange`: Updates the selected language

## Future Enhancements

1. Integration with actual translation APIs (Google Translate, DeepL, etc.)
2. OCR functionality to capture text from screen underneath
3. History of previous translations
4. User settings for appearance and behavior
5. Additional language options
6. Ability to copy translated text to clipboard

## Design Decisions

- The component uses CSS variables for easy theming
- Backdrop filter blur effect enhances readability of overlay content
- The component follows a self-contained pattern for easy reuse
