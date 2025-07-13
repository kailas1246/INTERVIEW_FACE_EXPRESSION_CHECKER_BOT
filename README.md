# AI Video Interview Bot - Facial Confidence Analyzer

A real-time AI-powered video interview bot that analyzes facial confidence and expressions using webcam technology. Features voice-based interview simulation with speech synthesis and recognition, providing comprehensive feedback on interview performance.

## Features

- **Real-time Facial Analysis**: Confidence scoring, eye contact tracking, head posture analysis
- **Expression Detection**: Recognizes 7 emotions (neutral, happy, focused, confident, surprised, sad, angry)
- **Voice Interview Simulation**: AI speaks questions and analyzes your spoken responses
- **Performance Monitoring**: Real-time CPU, memory, FPS, and latency tracking
- **Data Export**: Export session data, generate reports, and share results
- **Configurable Settings**: Adjust detection sensitivity, update frequency, and audio feedback

## Installation and Setup

### Prerequisites

Make sure you have the following installed on your system:

- **Node.js** (version 16 or higher)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`
- **npm** (comes with Node.js)
  - Verify installation: `npm --version`

### Step 1: Download and Extract

1. Download the project ZIP file
2. Extract it to your desired location
3. Open a terminal/command prompt
4. Navigate to the extracted folder:
   ```bash
   cd path/to/ai-video-interview-bot
   ```

### Step 2: Install Dependencies

Install all required packages:

```bash
npm install
```

This will install all necessary dependencies including:
- React, TypeScript, and Vite for the frontend
- Express.js for the backend
- Face detection libraries
- UI components and styling libraries

### Step 3: Start the Application

Run the development server:

```bash
npm run dev
```

The application will start and you should see:
```
[express] serving on port 5000
```

### Step 4: Access the Application

Open your web browser and go to:
```
http://localhost:5000
```

You should see the AI Video Interview Analyzer interface.

### Step 5: Grant Permissions

When you first use the application:

1. **Camera Permission**: Your browser will ask for camera access - click "Allow"
2. **Microphone Permission**: For voice features, allow microphone access when prompted

## How to Use

### Basic Analysis
1. Click "Start Camera" to activate your webcam
2. Click "Start Analysis" to begin facial analysis
3. View real-time confidence scores and expression detection

### Voice Interview Simulation
1. Navigate to the "Interview Simulation" section (right panel)
2. Click "Start Voice Interview"
3. Listen to the AI-spoken questions
4. Click "Start Answer" and speak your response
5. Receive real-time feedback and scoring

### Export Data
1. After conducting an analysis session
2. Use the "Export Session Data" button to download results
3. Generate comprehensive reports with the "Generate Report" button

## Browser Compatibility

**Recommended Browsers:**
- Chrome 80+ (best performance)
- Firefox 75+
- Safari 13+
- Edge 80+

**Required Browser Features:**
- WebRTC (for camera access)
- Web Speech API (for voice features)
- Canvas API (for face detection overlay)

## Troubleshooting

### Common Issues

**Camera not working:**
- Ensure camera permissions are granted
- Check if another application is using the camera
- Try refreshing the page and granting permissions again

**Voice features not working:**
- Ensure microphone permissions are granted
- Check browser compatibility with Web Speech API
- Verify speakers/headphones are working for audio output

**Application won't start:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try starting again
npm run dev
```

**Port already in use:**
If port 5000 is already in use, the application will automatically try other ports. Check the terminal output for the actual port number.

## Technical Architecture

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling with cyber theme
- **Radix UI** components for accessibility
- **TanStack Query** for state management
- **Wouter** for routing

### Backend
- **Express.js** server
- **TypeScript** throughout
- **Vite** for development and building

### AI/ML Features
- **Face-api.js** for facial detection and analysis
- **Web Speech API** for voice recognition and synthesis
- **Custom algorithms** for confidence scoring

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run check

# Database operations (if using database)
npm run db:push
```

### Project Structure

```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Main application pages
│   │   └── utils/        # Utility functions
├── server/               # Backend Express server
├── shared/               # Shared types and schemas
└── package.json          # Dependencies and scripts
```

## Privacy and Security

- **No Data Collection**: All analysis happens locally in your browser
- **No External Servers**: Face detection runs entirely client-side
- **Camera Access**: Only used for real-time analysis, no video recording
- **Voice Data**: Speech recognition happens locally, no audio stored

## Contributing

This is an open-source project. Feel free to:
- Report bugs or issues
- Suggest new features
- Submit pull requests
- Improve documentation

## License

This project is open source and available under the MIT License.

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Ensure all prerequisites are installed
3. Verify browser compatibility
4. Check browser console for error messages

For the best experience, use Chrome or Firefox with a good quality webcam and microphone.

---

**Version**: 2.1  
**Last Updated**: January 2025  
**Compatibility**: Node.js 16+, Modern Browsers