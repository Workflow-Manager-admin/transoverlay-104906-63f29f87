/**
 * Translation Service - Provides translation functionality using public APIs
 * 
 * This service handles translation between different languages using
 * freely available translation APIs with fallback mechanisms if one fails.
 */

// Mapping between app language codes and LibreTranslate API language codes
const languageCodeMapping = {
  // App to API mapping
  'en': 'en',
  'es': 'es',
  'fr': 'fr',
  'de': 'de',
  'it': 'it',
  'ja': 'ja',
  'ko': 'ko',
  'zh': 'zh',
  'ru': 'ru',
  // From franc detection to app codes
  'eng': 'en',
  'spa': 'es',
  'fra': 'fr',
  'deu': 'de',
  'ita': 'it',
  'jpn': 'ja',
  'kor': 'ko',
  'cmn': 'zh',
  'rus': 'ru',
};

/**
 * Maps a language code from one format to another
 * @param {string} code - The language code to map
 * @param {object} mapping - Mapping object (defaults to languageCodeMapping)
 * @returns {string} - The mapped language code, or the original if not found
 */
const mapLanguageCode = (code, mapping = languageCodeMapping) => {
  return mapping[code] || code;
};

/**
 * Use LibreTranslate API to translate text
 * @param {string} text - Text to translate
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code
 * @returns {Promise<string>} - Promise resolving to translated text
 */
const translateWithLibreTranslate = async (text, sourceLang, targetLang) => {
  try {
    // Map language codes to the format expected by the API
    const apiSourceLang = mapLanguageCode(sourceLang);
    const apiTargetLang = mapLanguageCode(targetLang);
    
    // Use public LibreTranslate instance
    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      body: JSON.stringify({
        q: text,
        source: apiSourceLang,
        target: apiTargetLang,
        format: 'text',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`LibreTranslate API error: ${response.status}`);
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('LibreTranslate translation failed:', error);
    throw error;
  }
};

/**
 * Alternative translation using MyMemory API as a fallback
 * @param {string} text - Text to translate
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code
 * @returns {Promise<string>} - Promise resolving to translated text
 */
const translateWithMyMemory = async (text, sourceLang, targetLang) => {
  try {
    // Map language codes to the format expected by the API
    const apiSourceLang = mapLanguageCode(sourceLang);
    const apiTargetLang = mapLanguageCode(targetLang);
    
    // Construct language pair
    const langPair = `${apiSourceLang}|${apiTargetLang}`;
    
    // Use MyMemory API
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langPair)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.responseStatus === 200) {
      return data.responseData.translatedText;
    } else {
      throw new Error(`MyMemory API error: ${data.responseStatus} - ${data.responseDetails}`);
    }
  } catch (error) {
    console.error('MyMemory translation failed:', error);
    throw error;
  }
};

/**
 * Mock translation as a last resort fallback
 * @param {string} text - Text to translate
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code
 * @returns {string} - Simple mock-translated text
 */
const mockTranslate = (text, sourceLang, targetLang) => {
  // This is a simple mock translation that just adds a prefix
  // Only used as a last resort if all APIs fail
  return `[${sourceLang} → ${targetLang}] ${text}`;
};

/**
 * Main translation function that tries multiple services with fallbacks
 * @param {string} text - Text to translate
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code
 * @returns {Promise<object>} - Promise resolving to object with translated text and metadata
 */
export const translateText = async (text, sourceLang, targetLang) => {
  // Don't attempt to translate if source and target languages are the same
  if (mapLanguageCode(sourceLang) === mapLanguageCode(targetLang)) {
    return {
      translatedText: text,
      sourceLang,
      targetLang,
      service: 'none',
      success: true,
    };
  }

  // Don't translate empty text
  if (!text || text.trim() === '') {
    return {
      translatedText: '',
      sourceLang,
      targetLang,
      service: 'none',
      success: true,
    };
  }

  // Try multiple translation services with fallbacks
  try {
    // First try LibreTranslate
    try {
      const result = await translateWithLibreTranslate(text, sourceLang, targetLang);
      return {
        translatedText: result,
        sourceLang,
        targetLang,
        service: 'LibreTranslate',
        success: true,
      };
    } catch (error) {
      // If LibreTranslate fails, try MyMemory
      console.log('Falling back to MyMemory translation service...');
      try {
        const result = await translateWithMyMemory(text, sourceLang, targetLang);
        return {
          translatedText: result,
          sourceLang,
          targetLang,
          service: 'MyMemory',
          success: true,
        };
      } catch (secondError) {
        // If all APIs fail, use mock translation
        console.log('All translation services failed, using mock translation.');
        return {
          translatedText: mockTranslate(text, sourceLang, targetLang),
          sourceLang,
          targetLang,
          service: 'Mock',
          success: true,
          fallback: true,
        };
      }
    }
  } catch (finalError) {
    // Something went catastrophically wrong
    console.error('Translation completely failed:', finalError);
    return {
      translatedText: text, // Return original text on complete failure
      sourceLang,
      targetLang,
      service: 'error',
      success: false,
      error: finalError.message,
    };
  }
};

// Export a simplified version of the languageCodeMapping
export const supportedLanguages = Object.entries(languageCodeMapping)
  .filter(([key]) => key.length === 2) // Only export the 2-letter codes (app codes)
  .reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});
