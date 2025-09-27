import { useState, useEffect } from 'react';
import { Download, Settings, Type, Palette, Shield, Maximize, Globe, Image as ImageIcon } from 'lucide-react';
import QRCode from 'qrcode';

interface QROptions {
  text: string;
  size: number;
  foreground: string;
  background: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  embedLogo: boolean;
}

export default function QRGenerator() {
  const [options, setOptions] = useState<QROptions>({
    text: 'Hello, World!',
    size: 256,
    foreground: '#000000',
    background: '#FFFFFF',
    errorCorrectionLevel: 'M',
    margin: 4,
    embedLogo: true
  });
  
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [isLoadingLogo, setIsLoadingLogo] = useState(false);
  const [isUrl, setIsUrl] = useState(false);

  // URL detection function
  const isValidUrl = (text: string): boolean => {
    try {
      const url = new URL(text.startsWith('http') ? text : `https://${text}`);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Extract domain from URL
  const extractDomain = (text: string): string => {
    try {
      const url = new URL(text.startsWith('http') ? text : `https://${text}`);
      return url.hostname;
    } catch {
      return '';
    }
  };

  // Fetch website logo
  const fetchLogo = async (url: string): Promise<string | null> => {
    try {
      setIsLoadingLogo(true);
      const response = await fetch('/api/logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.logoUrl;
      }
      return null;
    } catch (error) {
      console.error('Error fetching logo:', error);
      return null;
    } finally {
      setIsLoadingLogo(false);
    }
  };

  // Generate QR code with logo overlay
  const generateQRWithLogo = async (qrCanvas: HTMLCanvasElement, logoDataUrl: string): Promise<string> => {
    const ctx = qrCanvas.getContext('2d');
    if (!ctx) return '';

    return new Promise((resolve) => {
      const logoImg = document.createElement('img');
      logoImg.crossOrigin = 'anonymous';
      logoImg.onload = () => {
        const logoSize = Math.min(qrCanvas.width, qrCanvas.height) * 0.2;
        const x = (qrCanvas.width - logoSize) / 2;
        const y = (qrCanvas.height - logoSize) / 2;

        // Create a white background circle for the logo
        ctx.fillStyle = options.background;
        ctx.beginPath();
        ctx.arc(qrCanvas.width / 2, qrCanvas.height / 2, logoSize / 2 + 8, 0, 2 * Math.PI);
        ctx.fill();

        // Draw the logo
        ctx.drawImage(logoImg, x, y, logoSize, logoSize);
        
        resolve(qrCanvas.toDataURL());
      };
      logoImg.onerror = () => {
        console.warn('Failed to load logo, using plain QR code');
        resolve(qrCanvas.toDataURL());
      };
      logoImg.src = logoDataUrl;
    });
  };

  const generateQR = async () => {
    if (!options.text.trim()) return;
    
    try {
      // Check if text is a URL
      const urlDetected = isValidUrl(options.text);
      setIsUrl(urlDetected);

      // Generate base QR code
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, options.text, {
        width: options.size,
        margin: options.margin,
        color: {
          dark: options.foreground,
          light: options.background
        },
        errorCorrectionLevel: options.errorCorrectionLevel
      });

      // If it's a URL and logo embedding is enabled, try to add logo
      if (urlDetected && options.embedLogo) {
        const domain = extractDomain(options.text);
        if (domain) {
          const fetchedLogo = await fetchLogo(options.text);
          if (fetchedLogo) {
            setLogoUrl(fetchedLogo);
            const finalDataUrl = await generateQRWithLogo(canvas, fetchedLogo);
            setQrDataUrl(finalDataUrl);
            return;
          }
        }
      }

      // Fallback to regular QR code
      setLogoUrl('');
      setQrDataUrl(canvas.toDataURL());
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  useEffect(() => {
    generateQR();
  }, [options]);

  const downloadQR = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement('a');
    link.href = qrDataUrl;
    const filename = isUrl ? `qrcode-${extractDomain(options.text)}-${Date.now()}.png` : `qrcode-${Date.now()}.png`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const errorLevels = [
    { value: 'L', label: 'Low (~7%)', description: 'Good for clean environments' },
    { value: 'M', label: 'Medium (~15%)', description: 'Balanced option' },
    { value: 'Q', label: 'Quartile (~25%)', description: 'Good for industrial use' },
    { value: 'H', label: 'High (~30%)', description: 'Maximum error correction' }
  ];

  const sizes = [128, 192, 256, 384, 512, 768, 1024];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Type className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Content</h2>
              {isUrl && (
                <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                  <Globe className="w-3 h-3" />
                  <span>URL Detected</span>
                </div>
              )}
            </div>
            <textarea
              value={options.text}
              onChange={(e) => setOptions(prev => ({ ...prev, text: e.target.value }))}
              placeholder="Enter text, URL, or any content to generate QR code..."
              className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Characters: {options.text.length}
              </div>
              {isUrl && (
                <div className="text-sm text-blue-600 font-medium">
                  Domain: {extractDomain(options.text)}
                </div>
              )}
            </div>
          </div>

          {/* Logo Settings */}
          {isUrl && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-800">Logo Integration</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-700">Embed Website Logo</div>
                    <div className="text-sm text-gray-500">Automatically fetch and embed the website's logo</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.embedLogo}
                      onChange={(e) => setOptions(prev => ({ ...prev, embedLogo: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {options.embedLogo && logoUrl && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img 
                        src={logoUrl} 
                        alt="Website logo" 
                        className="w-8 h-8 rounded object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="text-sm text-gray-600">
                        Logo successfully loaded and will be embedded in QR code
                      </div>
                    </div>
                  </div>
                )}

                {options.embedLogo && isLoadingLogo && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <div className="text-sm text-blue-700">
                        Fetching website logo...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Panel */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div 
              className="flex items-center justify-between cursor-pointer mb-4"
              onClick={() => setShowSettings(!showSettings)}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-800">Customization</h2>
              </div>
              <div className={`transform transition-transform ${showSettings ? 'rotate-180' : ''}`}>
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div className={`space-y-6 transition-all duration-300 ${showSettings ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
              {/* Size Selection */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Maximize className="w-4 h-4 text-green-600" />
                  <label className="font-medium text-gray-700">Size</label>
                </div>
                <select
                  value={options.size}
                  onChange={(e) => setOptions(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {sizes.map(size => (
                    <option key={size} value={size}>{size}x{size} px</option>
                  ))}
                </select>
              </div>

              {/* Color Customization */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="w-4 h-4 text-orange-600" />
                    <label className="font-medium text-gray-700">Foreground</label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={options.foreground}
                      onChange={(e) => setOptions(prev => ({ ...prev, foreground: e.target.value }))}
                      className="w-12 h-10 border border-gray-200 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={options.foreground}
                      onChange={(e) => setOptions(prev => ({ ...prev, foreground: e.target.value }))}
                      className="flex-1 p-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="w-4 h-4 text-orange-600" />
                    <label className="font-medium text-gray-700">Background</label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={options.background}
                      onChange={(e) => setOptions(prev => ({ ...prev, background: e.target.value }))}
                      className="w-12 h-10 border border-gray-200 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={options.background}
                      onChange={(e) => setOptions(prev => ({ ...prev, background: e.target.value }))}
                      className="flex-1 p-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Error Correction Level */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-red-600" />
                  <label className="font-medium text-gray-700">Error Correction</label>
                  {logoUrl && options.embedLogo && (
                    <div className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                      Higher levels recommended with logo
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {errorLevels.map(level => (
                    <button
                      key={level.value}
                      onClick={() => setOptions(prev => ({ ...prev, errorCorrectionLevel: level.value as 'L' | 'M' | 'Q' | 'H' }))}
                      className={`p-3 rounded-lg border transition-all text-left ${
                        options.errorCorrectionLevel === level.value
                          ? 'bg-blue-50 border-blue-300 text-blue-800'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{level.label}</div>
                      <div className="text-xs text-gray-600">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Margin */}
              <div>
                <label className="block font-medium text-gray-700 mb-3">
                  Margin: {options.margin} modules
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={options.margin}
                  onChange={(e) => setOptions(prev => ({ ...prev, margin: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Preview</h2>
              <button
                onClick={downloadQR}
                disabled={!qrDataUrl}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>

            <div className="flex justify-center p-8 bg-gray-50 rounded-xl">
              {qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt="Generated QR Code" 
                  className="max-w-full h-auto shadow-lg rounded-lg"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">Enter content to generate QR code</span>
                </div>
              )}
            </div>

            {qrDataUrl && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>QR Code Info:</strong><br />
                  Size: {options.size}×{options.size}px<br />
                  Error Correction: {options.errorCorrectionLevel}<br />
                  Content Length: {options.text.length} characters
                  {isUrl && <><br />Type: Website URL</>}
                  {logoUrl && options.embedLogo && <><br />Logo: Embedded</>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
