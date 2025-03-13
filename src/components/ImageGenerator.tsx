import { useState } from 'react';
import axios from 'axios';

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt) return;

    setLoading(true);
    setError(null);

    const apiKey = import.meta.env.VITE_STABILITY_API_KEY;
    
    if (!apiKey) {
      setError('API key is missing. Please check your environment configuration.');
      setLoading(false);
      return;
    }

    try {
      console.log('Making API request with key:', apiKey.substring(0, 10) + '...');
      
      const response = await axios.post('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        steps: 30,
        samples: 1,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.data || !response.data.artifacts || !response.data.artifacts[0]) {
        throw new Error('Invalid response format from API');
      }

      const generatedImage = response.data.artifacts[0].base64;
      setImage(`data:image/png;base64,${generatedImage}`);
    } catch (err: any) {
      console.error('Detailed error:', err.response?.data || err.message || err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to generate image. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <label htmlFor="prompt" className="block text-lg font-medium text-gray-700">
          Enter your prompt
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="input min-h-[100px]"
          placeholder="A serene landscape with mountains and a lake at sunset..."
        />
        <button
          onClick={generateImage}
          disabled={loading || !prompt}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Generate Image'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {image && (
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-gray-900">Generated Image</h2>
          <div className="relative aspect-square w-full max-w-2xl mx-auto">
            <img
              src={image}
              alt="Generated"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
} 