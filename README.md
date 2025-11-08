# ASL Recognition App

A web application for recognizing American Sign Language (ASL) gestures using machine learning.

## Project Structure

```
asl-recognition-app/
├── frontend/           # React frontend application
├── backend/           # Flask backend server
└── README.md
```

## Setup Instructions

### Backend Setup

1. Create and activate virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the backend server:
```bash
python app.py
```

The backend server will run on http://localhost:5000

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run the development server:
```bash
npm start
```

The frontend application will run on http://localhost:3000

## Features

- Real-time ASL gesture recognition
- Image upload functionality
- User-friendly interface

## Technologies Used

- Frontend: React.js
- Backend: Flask
- Machine Learning: TensorFlow
- API: REST

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
