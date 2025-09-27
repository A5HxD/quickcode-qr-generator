import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono<{ Bindings: Env }>();

// Schema for logo fetch request
const LogoRequestSchema = z.object({
  url: z.string().url(),
});

// API endpoint to fetch website logos
app.post('/api/logo', zValidator('json', LogoRequestSchema), async (c) => {
  try {
    const { url } = c.req.valid('json');
    
    // Extract domain from URL
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // Try different favicon sources
    const faviconSources = [
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      `https://${domain}/favicon.ico`,
      `https://${domain}/apple-touch-icon.png`,
      `https://${domain}/favicon.png`
    ];

    // Test each favicon source
    for (const faviconUrl of faviconSources) {
      try {
        const response = await fetch(faviconUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; QRGenerator/1.0)',
          },
        });
        
        if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
          // Convert to data URL for frontend use
          const arrayBuffer = await response.arrayBuffer();
          const contentType = response.headers.get('content-type') || 'image/png';
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          const dataUrl = `data:${contentType};base64,${base64}`;
          
          return c.json({ 
            logoUrl: dataUrl,
            source: faviconUrl,
            domain 
          });
        }
      } catch (error) {
        console.log(`Failed to fetch from ${faviconUrl}:`, error);
        continue;
      }
    }

    // If no favicon found, return error
    return c.json({ error: 'No logo found for this website' }, 404);
    
  } catch (error) {
    console.error('Logo fetch error:', error);
    return c.json({ error: 'Failed to fetch logo' }, 500);
  }
});

export default app;
