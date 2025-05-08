const GEMINI_API_KEY = 'AIzaSyDv4B5PeKGnuQ3Pf20EAcsTrCDksgKsqyo';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function generateContent(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

// Test function to verify API connection
export async function testApiConnection(): Promise<void> {
  try {
    const testPrompt = "Explain how AI works in one sentence.";
    const result = await generateContent(testPrompt);
    console.log('API Test Result:', result);
  } catch (error) {
    console.error('API Test Failed:', error);
  }
} 