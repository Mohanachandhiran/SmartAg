import os
import zipfile
import json
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV3Small
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

# Configuration
ZIP_PATH = r"C:\Users\mohan\Downloads\archive.zip"
EXTRACT_DIR = r"datasets"
# Assuming the zip extracts to a folder that contains the classes. 
# We'll figure out the exact data dir after extraction.
MODEL_SAVE_PATH = "crop_disease_model.h5"
CLASS_INDICES_PATH = "class_indices.json"

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 3 # Keep low for fast demonstration, increase for production accuracy

def extract_dataset():
    print(f"Extracting {ZIP_PATH} to {EXTRACT_DIR}...")
    os.makedirs(EXTRACT_DIR, exist_ok=True)
    with zipfile.ZipFile(ZIP_PATH, 'r') as zip_ref:
        zip_ref.extractall(EXTRACT_DIR)
    print("Extraction complete.")

def find_data_dir(base_dir):
    """
    Finds the directory containing the class folders. 
    Sometimes zip files have a top-level directory (e.g., 'PlantVillage/').
    """
    for root, dirs, files in os.walk(base_dir):
        # If a directory has multiple subdirectories and no files, it's likely the parent of the classes
        if len(dirs) > 5:
            return root
    return base_dir

def build_model(num_classes):
    base_model = MobileNetV3Small(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    base_model.trainable = False # Freeze base model initially
    
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.2)(x)
    predictions = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    return model

def train():
    if not os.path.exists(EXTRACT_DIR) or len(os.listdir(EXTRACT_DIR)) == 0:
        extract_dataset()
    else:
        print("Dataset already extracted.")
        
    data_dir = find_data_dir(EXTRACT_DIR)
    print(f"Using data directory: {data_dir}")
    
    print("Loading datasets...")
    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="training",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE
    )
    
    val_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="validation",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE
    )
    
    class_names = train_ds.class_names
    print(f"Found {len(class_names)} classes.")
    
    # Save class names mapping
    with open(CLASS_INDICES_PATH, "w") as f:
        json.dump(class_names, f)
        
    print("Building model...")
    model = build_model(len(class_names))
    
    # Callbacks
    callbacks = [
        ModelCheckpoint(MODEL_SAVE_PATH, save_best_only=True, monitor='val_accuracy', mode='max'),
        EarlyStopping(monitor='val_loss', patience=2)
    ]
    
    print(f"Training for {EPOCHS} epochs...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=callbacks
    )
    
    print("Training complete. Model saved to", MODEL_SAVE_PATH)
    
if __name__ == "__main__":
    train()
