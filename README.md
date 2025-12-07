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

## Model Information

The ASL recognition model is a Convolutional Neural Network (CNN) trained on the Sign MNIST dataset.

### Architecture
- **Input**: 28x28 grayscale images
- **Layers**:
  - 3 Convolutional blocks (Conv2D + BatchNormalization + MaxPooling2D)
  - Flatten layer
  - Dense layer (256 units, ReLU activation)
  - Dropout (0.5)
  - Output Dense layer (24 units, Softmax activation)

### Data Preprocessing
- Images are resized to 28x28 pixels.
- Converted to grayscale.
- Pixel values are normalized to the range [0, 1] (divided by 255.0).

### Classes
The model recognizes 24 ASL letters (A-Y), excluding 'J' and 'Z' as they require motion.
- **Supported**: A, B, C, D, E, F, G, H, I, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y

### Performance
- **Test Accuracy**: ~99.9% on the Sign MNIST test set.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
