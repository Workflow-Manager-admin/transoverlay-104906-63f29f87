import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { franc } from 'franc-min';
import { translateText } from '../services/translationService';
import './TransOverlay.css';

/**
 * TransOverlay Component - The main container component for the TransOverlay application.
 * This component creates a transparent, draggable, resizable overlay that can be positioned
 * over any window or text content for real-time translation.
 * 
 * @returns {JSX.Element} The TransOverlay component
 */
const TransOverlay = () => {
  // Core positioning and sizing
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 400, height: 300 });
  
  // Text and translation states
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [hoveredText, setHoveredText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  
  // UI states
  const [selectedLanguage, setSelectedLanguage] = useState('es'); // Default to Spanish
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(null);
  const [translationService, setTranslationService] = useState('');
  
  const overlayRef = useRef(null);
  const hoverTimerRef = useRef(null);

  // List of supported languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese (Simplified)' },
    { code: 'ru', name: 'Russian' },
  ];

  // Map of language codes used by franc to more readable forms
  const languageCodeMap = {
    'eng': 'English',
    'spa': 'Spanish',
    'fra': 'French',
    'deu': 'German',
    'ita': 'Italian',
    'jpn': 'Japanese',
    'kor': 'Korean',
    'cmn': 'Chinese',
    'rus': 'Russian',
  };

  // Function to detect the language of the given text
  const detectLanguage = (text) => {
    if (!text || text.trim().length < 10) {
      return ''; // Not enough text to detect language
    }
    
    try {
      const detectedCode = franc(text);
      // Return readable language name if available, otherwise the code
      return languageCodeMap[detectedCode] || detectedCode || '';
    } catch (error) {
      console.error('Error detecting language:', error);
      return '';
    }
  };

  // Real translation function that uses our translation service
  const performTranslation = async (text, sourceLang, targetLang) => {
    if (!text || text.trim() === '') return '';
    
    // Reset previous errors
    setTranslationError(null);
    setIsTranslating(true);
    
    try {
      const result = await translateText(text, sourceLang, targetLang);
      setTranslationService(result.service);
      
      if (result.success) {
        return result.translatedText;
      } else {
        setTranslationError("Translation failed: " + (result.error || "Unknown error"));
        return `[Error: Could not translate text]`;
      }
    } catch (error) {
      console.error('Translation error:', error);
      setTranslationError("Translation failed: " + error.message);
      return `[Error: Could not translate text]`;
    } finally {
      setIsTranslating(false);
    }
  };

  // Extract text from elements under the mouse pointer
  const extractTextFromPosition = (clientX, clientY) => {
    if (!isLocked) {
      // Get all elements at the current mouse position
      const elements = document.elementsFromPoint(clientX, clientY);
      
      // Filter out our own overlay elements
      const externalElements = elements.filter(el => {
        return !overlayRef.current?.contains(el);
      });
      
      // Try to extract text content
      if (externalElements.length > 0) {
        // Get the text content from the topmost external element
        let text = '';
        
        for (const el of externalElements) {
          // Skip if this is our own overlay or invisible elements
          if (el === overlayRef.current || 
              window.getComputedStyle(el).visibility === 'hidden' ||
              window.getComputedStyle(el).display === 'none') {
            continue;
          }
          
          // Try to get text directly
          const elText = el.innerText || el.textContent;
          if (elText && elText.trim()) {
            text = elText.trim();
            break;
          }
        }
        
        if (text && text !== hoveredText) {
          setHoveredText(text);
          const lang = detectLanguage(text);
          setDetectedLanguage(lang);
          
          // If we have text and detected a language, translate it
          if (text && lang) {
            performTranslation(text, lang, selectedLanguage)
              .then(translated => {
                setTranslatedText(translated);
              });
          }
        }
      }
    }
  };

  // Debounce the mouse movement to prevent excessive processing
  const debounce = (func, delay) => {
    return function(...args) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  // Debounced version of extractTextFromPosition
  const debouncedExtractText = useRef(
    debounce((x, y) => extractTextFromPosition(x, y), 300)
  ).current;

  // Handle mouse movement over the document when in hover mode
  const handleDocumentMouseMove = (e) => {
    if (isHovering && !isLocked) {
      debouncedExtractText(e.clientX, e.clientY);
    }
  };

  // Setup and cleanup global mousemove event listener
  useEffect(() => {
    if (isHovering) {
      document.addEventListener('mousemove', handleDocumentMouseMove);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      clearTimeout(hoverTimerRef.current);
    };
  }, [isHovering, isLocked]);

  // Handle manual text input and trigger translation
  useEffect(() => {
    if (originalText) {
      const lang = detectLanguage(originalText);
      setDetectedLanguage(lang);
      const translated = translateText(originalText, lang, selectedLanguage);
      setTranslatedText(translated);
    }
  }, [originalText, selectedLanguage]);
  
  // Update translation when detected language changes
  useEffect(() => {
    if (hoveredText && detectedLanguage) {
      const translated = translateText(hoveredText, detectedLanguage, selectedLanguage);
      setTranslatedText(translated);
    }
  }, [detectedLanguage, selectedLanguage]);

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
          setHoveredText('');
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
    setHoveredText('');
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  // Toggle hover mode
  const toggleHoverMode = () => {
    setIsHovering(!isHovering);
    if (!isHovering) {
      setHoveredText('');
      setOriginalText('');
      setTranslatedText('');
    }
  };

  // Toggle lock state
  const toggleLock = () => {
    setIsLocked(!isLocked);
  };

  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      onDragStop={(e, d) => {
        setPosition({ x: d.x, y: d.y });
      }}
      onResize={(e, direction, ref, delta, position) => {
        setSize({
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        });
        setPosition(position);
      }}
      disableDragging={isLocked}
      enableResizing={!isLocked}
      dragHandleClassName="trans-overlay-header"
      bounds="parent"
      minWidth={200}
      minHeight={150}
    >
      <div 
        className={`trans-overlay-container ${isLocked ? 'locked' : ''}`}
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
            <div className="header-controls">
              <button 
                className={`control-button ${isHovering ? 'active' : ''}`}
                onClick={toggleHoverMode}
                title={isHovering ? 'Disable hover mode' : 'Enable hover mode'}
              >
                {isHovering ? 'Hover: On' : 'Hover: Off'}
              </button>
              <button 
                className={`control-button ${isLocked ? 'active' : ''}`}
                onClick={toggleLock}
                title={isLocked ? 'Unlock overlay (enable drag/resize)' : 'Lock overlay (click-through mode)'}
              >
                {isLocked ? 'Unlock' : 'Lock'}
              </button>
              <select 
                className="language-selector" 
                value={selectedLanguage} 
                onChange={handleLanguageChange}
                title="Select target language"
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
            {!isHovering && (
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
            )}
            
            {isHovering && hoveredText && (
              <div className="hover-info">
                <div className="hover-text">
                  <strong>Hovering over:</strong> {hoveredText.length > 50 ? `${hoveredText.substring(0, 50)}...` : hoveredText}
                </div>
                {detectedLanguage && (
                  <div className="detected-language">
                    <strong>Detected language:</strong> {detectedLanguage}
                  </div>
                )}
              </div>
            )}
            
            {translatedText && (
              <div className="translation-panel">
                <div className="original-text">
                  {isHovering ? hoveredText : originalText}
                </div>
                <div className="translated-text">{translatedText}</div>
              </div>
            )}
            
            {!isHovering && (
              <p style={{ color: 'white', fontSize: '12px', textAlign: 'center', margin: '5px 0' }}>
                {isDragOver 
                  ? 'Drop text file here' 
                  : 'Drag and drop a text file or type directly above'}
              </p>
            )}
            
            {isHovering && !hoveredText && (
              <p style={{ color: 'white', fontSize: '12px', textAlign: 'center', margin: '5px 0' }}>
                Move mouse over text to translate
              </p>
            )}
          </div>
          
          <div className="trans-overlay-footer">
            <div>
              <span style={{ fontSize: '12px', color: 'white' }}>
                {isHovering ? 
                  `${detectedLanguage ? `From: ${detectedLanguage}` : 'Hover over text'} → To: ${languages.find(lang => lang.code === selectedLanguage)?.name}` :
                  `Selected: ${languages.find(lang => lang.code === selectedLanguage)?.name}`}
              </span>
            </div>
            <div>
              <button 
                className="control-button" 
                onClick={() => {
                  setOriginalText('');
                  setHoveredText('');
                  setTranslatedText('');
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </Rnd>
  );
};

export default TransOverlay;
