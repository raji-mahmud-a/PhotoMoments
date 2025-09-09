# PhotoMoments 📸

> Personal photo memory timeline where moments come alive with stories

[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## 🌟 Overview

PhotoMoments transforms how you preserve and relive memories. Upload photos with rich stories, organize them by months, and create a beautiful timeline of your life experiences. Built with modern web technologies and Firebase for seamless real-time synchronization.

### ✨ Key Features

- 📅 **Monthly Organization** - Automatically organize photos by month with intuitive navigation
- 📝 **Rich Stories** - Add detailed stories and context to preserve memories
- 🎨 **Responsive Gallery** - Beautiful CSS Grid layout that works on all devices
- 🖼️ **Modal Viewing** - Full-screen photo viewing with story details
- 🔄 **Real-time Sync** - Firebase-powered real-time updates across devices
- 🔐 **Secure Authentication** - Private personal galleries with Firebase Auth
- ⚡ **Progressive Loading** - Optimized image loading and smooth interactions

## 🚀 Live Demo

🔗 **[View Live App](https://photomoments.web.app)** *(Coming Soon)*

## 📱 Screenshots

| Gallery View | Photo Modal | Upload Interface |
|--------------|-------------|------------------|
| ![Gallery](./screenshots/gallery.png) | ![Modal](./screenshots/modal.png) | ![Upload](./screenshots/upload.png) |

*Screenshots will be added as development progresses*

## 🏗️ Technical Architecture

### Frontend Stack
- **HTML5** - Semantic markup with accessibility considerations
- **CSS3** - Modular architecture with CSS Grid and custom properties
- **Vanilla JavaScript** - ES6+ with modular component architecture
- **Firebase SDK (CDN)** - Client-side Firebase integration
- **CSS Grid** - Responsive masonry gallery layout
- **Progressive Enhancement** - Works without JavaScript for core functionality

### Backend Stack
- **Firebase Authentication** - Secure user management (via CDN)
- **Cloud Firestore** - NoSQL database for photo metadata (via CDN)
- **Firebase Storage** - Scalable file storage with CDN (via CDN)
- **No server required** - Pure client-side application

### Development Tools
- **Live Server** - Local development server
- **Git** - Version control with feature branches
- **Any Static Host** - Netlify, Vercel, GitHub Pages, or custom hosting

## 🗄️ Database Schema

### Firestore Collections

```javascript
// User document
users/{userId} {
  email: string,
  displayName: string,
  createdAt: timestamp,
  photoCount: number
}

// Photos subcollection
users/{userId}/photos/{photoId} {
  fileName: string,
  storagePath: string,
  thumbnailPath: string,
  photoDate: string,           // YYYY-MM-DD
  uploadDate: timestamp,
  story: string,
  location?: string,
  tags: string[],
  monthYear: string            // YYYY-MM for efficient queries
}

// Monthly indexes for optimization
users/{userId}/months/{monthYear} {
  month: string,               // YYYY-MM
  photoCount: number,
  firstPhoto: string,          // photoId
  lastUpdated: timestamp
}
```

### Firebase Storage Structure

```
/users/{userId}/
  /photos/
    - original_photo1.jpg
    - original_photo2.jpg
  /thumbnails/
    - thumb_photo1.jpg
    - thumb_photo2.jpg
```

## 🎯 Core Functionality

### Photo Upload Flow
1. **File Selection** - Drag-and-drop or file picker
2. **Client Compression** - Optimize images before upload
3. **Firebase Storage** - Secure file upload with progress tracking
4. **Metadata Storage** - Save photo details to Firestore
5. **Real-time Update** - Gallery updates automatically

### Monthly Organization System
```javascript
// Efficient month-based queries
const photosQuery = query(
  collection(db, `users/${userId}/photos`),
  where("monthYear", "==", "2024-01"),
  orderBy("photoDate", "desc")
);
```

### Gallery Rendering
- **CSS Grid** - Responsive masonry layout
- **Lazy Loading** - Images load as they enter viewport
- **Hover Effects** - Preview stories on hover
- **Modal System** - Full-screen viewing with navigation

## 📁 Project Structure

```
photomoments/
├── index.html                     # Main gallery page
├── upload.html                    # Photo upload interface  
├── login.html                     # Authentication page
├── css/
│   ├── foundation/
│   │   ├── variables.css         # CSS custom properties
│   │   ├── reset.css             # Normalize styles
│   │   └── typography.css        # Font definitions
│   ├── layout/
│   │   ├── header.css            # Site navigation
│   │   └── grid-system.css       # Gallery grid layout
│   ├── components/
│   │   ├── photo-card.css        # Individual photo styling
│   │   ├── photo-modal.css       # Full-screen modal
│   │   ├── month-tabs.css        # Monthly navigation
│   │   ├── upload-zone.css       # Drag-drop upload area
│   │   └── form-elements.css     # Buttons, inputs, forms
│   ├── pages/
│   │   ├── gallery.css           # Gallery-specific styles
│   │   ├── upload.css            # Upload page styles
│   │   └── auth.css              # Authentication styles
│   └── main.css                  # CSS entry point
├── js/
│   ├── firebase/
│   │   ├── config.js             # Firebase CDN configuration
│   │   ├── auth.js               # Authentication helpers
│   │   ├── storage.js            # File upload/download
│   │   └── firestore.js          # Database operations
│   ├── components/
│   │   ├── photo-gallery.js      # Gallery rendering logic
│   │   ├── photo-modal.js        # Modal interactions
│   │   ├── month-navigator.js    # Month switching
│   │   └── photo-uploader.js     # File upload handling
│   ├── utils/
│   │   ├── image-utils.js        # Image compression/processing
│   │   ├── date-utils.js         # Date formatting helpers
│   │   └── dom-utils.js          # DOM manipulation helpers
│   └── app.js                    # Application entry point
├── assets/
│   ├── icons/                    # UI icons and graphics
│   └── screenshots/              # App screenshots
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Modern web browser
- Code editor (VS Code recommended)
- Live Server extension or local development server
- Firebase project (free tier)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/photomoments.git
   cd photomoments
   ```

2. **Set up Firebase project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project
   - Enable Authentication, Firestore, and Storage
   - Get your config object from Project Settings

3. **Configure Firebase**
   ```html
   <!-- Add to your HTML head -->
   <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-storage-compat.js"></script>
   ```

   ```javascript
   // js/firebase/config.js
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   
   firebase.initializeApp(firebaseConfig);
   ```

4. **Start development server**
   ```bash
   # Using Live Server (VS Code extension)
   # Right-click index.html → "Open with Live Server"
   
   # Or using Python
   python -m http.server 8000
   
   # Or using Node.js
   npx serve .
   ```

5. **Deploy to your preferred platform**
   ```bash
   # Netlify
   npx netlify-cli deploy --prod --dir .
   
   # Vercel
   npx vercel --prod
   
   # GitHub Pages (push to gh-pages branch)
   git push origin gh-pages
   ```

## 🔐 Firebase Security Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /photos/{photoId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /months/{monthYear} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### Firebase Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🎨 CSS Architecture

### Modular Design System
```css
/* css/foundation/variables.css */
:root {
  --color-primary: #2563eb;
  --color-secondary: #64748b;
  --color-success: #10b981;
  --color-danger: #ef4444;
  
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 3rem;
  
  --font-family-base: 'Inter', system-ui, sans-serif;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
}
```

### Responsive Grid System
```css
/* css/layout/grid-system.css */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
}

@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--spacing-md);
    padding: var(--spacing-md);
  }
}
```

## ⚡ Performance Optimizations

### Image Handling
- **Client-side Compression** - Reduce file sizes before upload
- **Progressive JPEG** - Faster loading with progressive enhancement
- **WebP Support** - Modern format with JPEG fallback
- **Lazy Loading** - Load images as they enter viewport
- **Thumbnail Generation** - Optimized grid view images

### Database Optimization
- **Composite Indexes** - Efficient month + date queries
- **Pagination** - Load photos in batches
- **Real-time Listeners** - Optimized Firestore subscriptions
- **Offline Support** - Firebase local caching

### Frontend Performance
- **CSS Grid** - Hardware-accelerated layouts
- **Modular CSS** - Reduced bundle size
- **Event Delegation** - Efficient event handling
- **Image Preloading** - Smooth modal navigation

## 🧪 Testing

### Manual Testing Checklist
- [ ] User authentication (signup/login/logout)
- [ ] Photo upload with progress indication
- [ ] Gallery displays with proper grid layout
- [ ] Monthly navigation works correctly
- [ ] Modal opens/closes smoothly
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Offline functionality with cached data

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🚀 Deployment Options

### Static Hosting Platforms

**Netlify (Recommended)**
```bash
# Drag and drop your project folder to netlify.com
# Or connect GitHub repo for auto-deployment
```

**Vercel**
```bash
npx vercel --prod
# Follow prompts to deploy
```

**GitHub Pages**
```bash
# Push to gh-pages branch
git checkout -b gh-pages
git push origin gh-pages
# Enable GitHub Pages in repository settings
```

**Custom Hosting**
- Upload files to any web server
- Ensure HTTPS for Firebase security requirements
- Configure CORS if needed for Firebase Storage

### Environment Configuration

```javascript
// js/firebase/config.js - Production ready
const firebaseConfig = {
  apiKey: "your-production-api-key",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();
```

## 📈 Future Roadmap

### V2 Features
- [ ] **Family Sharing** - Collaborative family albums
- [ ] **AI Tagging** - Automatic photo categorization
- [ ] **Advanced Search** - Full-text search through stories
- [ ] **Photo Editing** - Basic cropping and filters
- [ ] **Export Options** - PDF/print photobooks

### V3 Features
- [ ] **Mobile Apps** - Native iOS/Android versions
- [ ] **Social Features** - Comments and reactions
- [ ] **Video Support** - Upload and organize videos
- [ ] **Timeline View** - Alternative chronological layout

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend Developer** - HTML/CSS architecture and responsive design
- **JavaScript Developer** - Interactive functionality and Firebase integration
- **Backend Consultant** - Firebase configuration and optimization

## 📞 Support

- 🐛 [Report bugs](https://github.com/yourusername/photomoments/issues)
- 💡 [Request features](https://github.com/yourusername/photomoments/issues)
- 📧 [Contact team](mailto:team@photomoments.dev)

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com/) - Backend infrastructure
- [Unsplash](https://unsplash.com/) - Sample photos for development
- [Heroicons](https://heroicons.com/) - Beautiful UI icons
- [Inter Font](https://rsms.me/inter/) - Typography

---

<div align="center">
  <strong>Built with ❤️ for preserving life's precious moments</strong>
</div>
