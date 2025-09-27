# QuickCode - Professional QR Code Generator

A modern, feature-rich QR code generator built with React, TypeScript, and Cloudflare Workers. Generate beautiful, customizable QR codes with advanced options including automatic logo embedding for websites.

## 🚀 Live Demo

[https://rmlnxmo65ylno.mocha.app](https://rmlnxmo65ylno.mocha.app)

## ✨ Features

- **Instant Generation**: Real-time QR code preview as you type
- **Full Customization**: Choose colors, sizes, error correction levels, and margins
- **Smart Logo Embedding**: Automatically fetches and embeds website logos for URL QR codes
- **High Quality Export**: Download crisp PNG images up to 1024×1024 pixels
- **URL Detection**: Automatically recognizes URLs and enables logo features
- **Mobile Responsive**: Works perfectly on desktop and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Hono.js on Cloudflare Workers
- **QR Generation**: qrcode library
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Cloudflare Workers + Pages

## 🎯 Use Cases

- **Business**: Create QR codes for websites, contact info, Wi-Fi passwords
- **Events**: Generate codes for event registration, venue check-ins
- **Marketing**: Link to social media, promotional campaigns, product pages
- **Personal**: Share contact details, personal websites, social profiles

## 🔧 Local Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/quickcode-qr-generator.git
cd quickcode-qr-generator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## 📱 Features Overview

### QR Code Customization
- **Size Options**: 128px to 1024px
- **Color Customization**: Full color picker for foreground and background
- **Error Correction**: Low (7%), Medium (15%), Quartile (25%), High (30%)
- **Margin Control**: Adjustable margin from 0-10 modules

### Smart Logo Integration
- Automatic website logo detection and embedding
- Fetches favicons from multiple sources for best compatibility
- Maintains QR code readability with proper logo sizing
- Fallback to plain QR code if logo unavailable

### Export Options
- High-quality PNG format
- Intelligent file naming (includes domain for URL QR codes)
- Optimized for printing and digital use

## 🏗️ Project Structure

```
src/
├── react-app/
│   ├── components/
│   │   └── QRGenerator.tsx    # Main QR generator component
│   ├── pages/
│   │   └── Home.tsx           # Home page with hero section
│   ├── App.tsx                # React Router setup
│   ├── main.tsx               # React app entry point
│   └── index.css              # Tailwind CSS imports
├── worker/
│   └── index.ts               # Cloudflare Worker API endpoints
└── shared/
    └── types.ts               # Shared TypeScript types
```

## 🔗 API Endpoints

### POST `/api/logo`
Fetches website logos for QR code embedding.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "logoUrl": "data:image/png;base64,...",
  "source": "https://icons.duckduckgo.com/ip3/example.com.ico",
  "domain": "example.com"
}
```

## 🎨 Design Philosophy

QuickCode follows modern design principles with:
- Clean, minimalist interface
- Gradient color schemes
- Smooth animations and transitions
- Intuitive user experience
- Mobile-first responsive design

## 🚀 Deployment

This app is designed to run on Cloudflare Workers + Pages:

1. **Frontend**: Static React app served from Cloudflare Pages
2. **Backend**: Serverless API running on Cloudflare Workers
3. **Global CDN**: Fast loading times worldwide

For manual deployment:
```bash
npm run build
wrangler deploy
```

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

If you find any bugs or have feature requests, please create an issue on GitHub.

---

Built with ❤️.
