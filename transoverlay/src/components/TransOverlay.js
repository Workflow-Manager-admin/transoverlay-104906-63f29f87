import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import './TransOverlay.css';

/**
 * TransOverlay Component - The main container component for the TransOverlay application.
 * This component creates a transparent, draggable overlay that can be positioned
 * over any window or text content for real-time translation.
 * 
 * @returns {JSX.Element} The TransOverlay component
 */
const TransOverlay = () => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 400, height: 300 });
  const [resizing, setResizing] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('es'); // Default to Spanish
  const [isDragOver, setIsDragOver] = useState(false);
  
  const overlayRef = useRef(null);
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });

  // List of supported languages
  const languages = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese (Simplified)' },
    { code: 'ru', name: 'Russian' },
  ];

  // Simulated translation function - In a real app, this would call a translation API
  const translateText = (text, targetLang) => {
    // For demo purposes, we're just appending the language code to the text
    // In a real application, this would call a translation API
    return `[${targetLang}] ${text} (translated)`;
  };

  // Handle text change and trigger translation
  useEffect(() => {
    if (originalText) {
      const translated = translateText(originalText, selectedLanguage);
      setTranslatedText(translated);
    }
  }, [originalText, selectedLanguage]);

  // Handle start of resize operation
  const handleResizeStart = (e) => {
    e.preventDefault();
    setResizing(true);
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = { ...size };
    
    // Add event listeners for mouse movement and mouse up
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  // Handle active resize operation
  const handleResize = (e) => {
    if (resizing) {
      const deltaX = e.clientX - resizeStartPos.current.x;
      const deltaY = e.clientY - resizeStartPos.current.y;
      
      setSize({
        width: Math.max(200, startSize.current.width + deltaX), // Minimum width of 200px
        height: Math.max(150, startSize.current.height + deltaY), // Minimum height of 150px
      });
    }
  };

  // Handle end of resize operation
  const handleResizeEnd = () => {
    setResizing(false);
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  // Handle drag start
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Handle drag end
  const handleDragEnd = (e, data) => {
    setIsDragging(false);
    setPosition({ x: data.x, y: data.y });
  };

  // Handle file drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  // Handle file drag leave
  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    // Handle dropped files
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Check if the file is a text file
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (event) => {
          setOriginalText(event.target.result);
        };
        reader.readAsText(file);
      } else {
        alert('Please drop a text file.');
      }
    }
  };

  // Handle text input change
  const handleTextChange = (e) => {
    setOriginalText(e.target.value);
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  return (
    <Draggable
      handle=".trans-overlay-header"
      position={position}
      onStart={handleDragStart}
      onStop={handleDragEnd}
      bounds="parent"
    >
      <div 
        className="trans-overlay-container"
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
        }}
        ref={overlayRef}
      >
        <div 
          className={`trans-overlay ${isDragOver ? 'drop-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="trans-overlay-header">
            <span>TransOverlay</span>
            <div>
              <select 
                className="language-selector" 
                value={selectedLanguage} 
                onChange={handleLanguageChange}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="trans-overlay-body">
            <textarea 
              placeholder="Type or drop text here for translation..."
              value={originalText}
              onChange={handleTextChange}
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid rgba(33, 150, 243, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '10px',
              }}
            />
            
            {translatedText && (
              <div className="translation-panel">
                <div className="original-text">{originalText}</div>
                <div className="translated-text">{translatedText}</div>
              </div>
            )}
            
            <p style={{ color: 'white', fontSize: '12px', textAlign: 'center', margin: '5px 0' }}>
              {isDragOver 
                ? 'Drop text file here' 
                : 'Drag and drop a text file or type directly above'}
            </p>
          </div>
          
          <div className="trans-overlay-footer">
            <div>
              <span style={{ fontSize: '12px', color: 'white' }}>
                Selected: {languages.find(lang => lang.code === selectedLanguage)?.name}
              </span>
            </div>
            <div>
              <button className="control-button" onClick={() => setOriginalText('')}>
                Clear
              </button>
            </div>
          </div>
          
          {/* Resize handle */}
          <div 
            className="trans-overlay-resize-handle"
            onMouseDown={handleResizeStart}
          />
        </div>
      </div>
    </Draggable>
  );
};

export default TransOverlay;
