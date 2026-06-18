import os
import json
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

# Configuration
DATA_DIR = r"C:\Users\mohan\Downloads\archive\PlantVillage\PlantVillage"
MODEL_SAVE_PATH = "crop_disease_model.h5"
CLASS_INDICES_PATH = "class_indices.json"

IMG_SIZE = (256, 256)
BATCH_SIZE = 32
EPOCHS = 5 # Reduced from 15 for faster demonstration. Increase for full training.

def build_model(num_classes, input_shape):
    model = Sequential()
    model.add(Conv2D(32, (5, 5), input_shape=input_shape, activation='relu'))
    model.add(MaxPooling2D(pool_size=(3, 3)))
    
    model.add(Conv2D(32, (3, 3), activation='relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))
    
    model.add(Conv2D(64, (3, 3), activation='relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))   
    
    model.add(Flatten())
    model.add(Dense(512, activation='relu'))
    model.add(Dropout(0.25))
    model.add(Dense(128, activation='relu'))          
    model.add(Dense(num_classes, activation='softmax'))
    
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.001), 
                  loss='sparse_categorical_crossentropy', 
                  metrics=['accuracy'])
    return model

def train():
    if not os.path.exists(DATA_DIR):
        print(f"Error: Dataset directory {DATA_DIR} not found.")
        return
        
    print(f"Using data directory: {DATA_DIR}")
    
    print("Loading datasets...")
    # The reference repo uses rescaling in datagen. We achieve this here by adding a Rescaling layer or 
    # relying on preprocess layer, but `image_dataset_from_directory` handles images in [0,255].
    # We will pass rescaling as part of a preprocessing step or model layer.
    
    train_ds = tf.keras.utils.image_dataset_from_directory(
        DATA_DIR,
        validation_split=0.2,
        subset="training",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE
    )
    
    val_ds = tf.keras.utils.image_dataset_from_directory(
        DATA_DIR,
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
    # Add a rescaling layer as the first layer to normalize pixel values to [0,1]
    normalization_layer = tf.keras.layers.Rescaling(1./255)
    normalized_train_ds = train_ds.map(lambda x, y: (normalization_layer(x), y))
    normalized_val_ds = val_ds.map(lambda x, y: (normalization_layer(x), y))
    
    model = build_model(len(class_names), input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3))
    model.summary()
    
    # Callbacks
    callbacks = [
        ModelCheckpoint(MODEL_SAVE_PATH, save_best_only=True, monitor='val_accuracy', mode='max'),
        EarlyStopping(monitor='val_loss', patience=2)
    ]
    
    print(f"Training for {EPOCHS} epochs...")
    history = model.fit(
        normalized_train_ds,
        validation_data=normalized_val_ds,
        epochs=EPOCHS,
        callbacks=callbacks
    )
    
    print("Training complete. Model saved to", MODEL_SAVE_PATH)
    
if __name__ == "__main__":
    train()
