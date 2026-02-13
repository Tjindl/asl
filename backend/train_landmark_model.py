"""
Train a landmark-based ASL classifier using MediaPipe hand landmarks.
Uses the ASL Alphabet Dataset (real hand photos, 200x200).
"""
import os
import sys
import numpy as np
import cv2
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import json

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'model')
DATASET_DIR = os.path.expanduser(
    '~/.cache/kagglehub/datasets/debashishsau/aslamerican-sign-language-aplhabet-dataset/versions/1/ASL_Alphabet_Dataset/asl_alphabet_train'
)
HAND_LANDMARKER_PATH = os.path.join(MODEL_DIR, 'hand_landmarker.task')

# ASL letters (excluding J and Z which require motion)
CLASS_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 'M',
                'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y']

MAX_IMAGES_PER_CLASS = 600  # Use up to 600 images per class


def normalize_landmarks(landmarks):
    """Normalize landmarks: translate to wrist origin, scale by hand size."""
    coords = np.array([[lm.x, lm.y, lm.z] for lm in landmarks])
    # Translate so wrist (landmark 0) is at origin
    wrist = coords[0].copy()
    coords -= wrist
    # Scale by distance from wrist to middle finger MCP (landmark 9)
    scale = np.linalg.norm(coords[9])
    if scale > 1e-6:
        coords /= scale
    return coords.flatten()  # 63 features


def extract_landmarks_from_images():
    """Extract hand landmarks from ASL dataset images."""
    # Setup hand landmarker
    base_options = mp_python.BaseOptions(model_asset_path=HAND_LANDMARKER_PATH)
    options = vision.HandLandmarkerOptions(
        base_options=base_options,
        num_hands=1,
        min_hand_detection_confidence=0.3,
        min_hand_presence_confidence=0.3,
    )
    landmarker = vision.HandLandmarker.create_from_options(options)

    all_features = []
    all_labels = []

    for label_idx, letter in enumerate(CLASS_LABELS):
        letter_dir = os.path.join(DATASET_DIR, letter)
        if not os.path.isdir(letter_dir):
            print(f"Warning: Directory not found for letter {letter}, skipping")
            continue

        images = [f for f in os.listdir(letter_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        images = images[:MAX_IMAGES_PER_CLASS]
        detected = 0

        for img_file in images:
            img_path = os.path.join(letter_dir, img_file)
            try:
                img = cv2.imread(img_path)
                if img is None:
                    continue
                img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
                result = landmarker.detect(mp_image)

                if result.hand_landmarks and len(result.hand_landmarks) > 0:
                    features = normalize_landmarks(result.hand_landmarks[0])
                    all_features.append(features)
                    all_labels.append(label_idx)
                    detected += 1
            except Exception as e:
                continue

        print(f"  {letter}: {detected}/{len(images)} hands detected")

    landmarker.close()
    return np.array(all_features), np.array(all_labels)


def train_model(X, y):
    """Train a Random Forest classifier on landmark features."""
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"\nTraining set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")

    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=30,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nTest accuracy: {acc*100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(
        y_test, y_pred,
        target_names=CLASS_LABELS,
        digits=3
    ))

    return clf


def main():
    print("=" * 60)
    print("ASL Landmark Classifier Training")
    print("=" * 60)

    # Check prerequisites
    if not os.path.exists(HAND_LANDMARKER_PATH):
        print(f"Error: Hand landmarker model not found at {HAND_LANDMARKER_PATH}")
        sys.exit(1)
    if not os.path.isdir(DATASET_DIR):
        print(f"Error: Dataset not found at {DATASET_DIR}")
        sys.exit(1)

    # Step 1: Extract landmarks
    print("\nStep 1: Extracting landmarks from images...")
    X, y = extract_landmarks_from_images()
    print(f"\nTotal samples extracted: {len(X)}")

    if len(X) < 100:
        print("Error: Too few samples extracted. Check the dataset.")
        sys.exit(1)

    # Step 2: Train classifier
    print("\nStep 2: Training Random Forest classifier...")
    clf = train_model(X, y)

    # Step 3: Save model and metadata
    model_path = os.path.join(MODEL_DIR, 'asl_landmark_model.joblib')
    joblib.dump(clf, model_path)
    print(f"\nModel saved to {model_path}")

    metadata = {
        'class_labels': CLASS_LABELS,
        'num_features': 63,
        'num_classes': len(CLASS_LABELS),
        'total_samples': len(X),
    }
    metadata_path = os.path.join(MODEL_DIR, 'landmark_model_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata saved to {metadata_path}")

    print("\nTraining complete!")


if __name__ == '__main__':
    main()
