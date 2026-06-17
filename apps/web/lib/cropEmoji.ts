export const getCropEmoji = (name: string): string => {
  const map: Record<string, string> = {
    'Rice': '🍚', 'Wheat': '🌾', 'Maize': '🌽', 'Sugarcane': '🎋', 'Cotton': '☁️',
    'Jowar': '🌾', 'Bajra': '🌿', 'Ragi': '🪴', 'Barley': '🌾', 'Oats': '🌾',
    'Gram': '🫘', 'Pigeon Pea': '🟡', 'Moong Bean': '🟢', 'Urad Bean': '⚫', 'Masoor': '🔴',
    'Arhar': '🟡', 'Tur (Arhar)': '🟡', 'Urad': '⚫', 'Moong': '🟢', 'Masur': '🔴',
    'Groundnut': '🥜', 'Soybean': '🫛', 'Soyabean': '🫛', 'Sunflower': '🌻', 'Mustard': '🌼',
    'Tomato': '🍅', 'Potato': '🥔', 'Onion': '🧅', 'Garlic': '🧄', 'Brinjal': '🍆',
    'Chilli': '🌶️', 'Cabbage': '🥬', 'Cauliflower': '🥦', 'Cucumber': '🥒', 'Pumpkin': '🎃',
    'Lady Finger': '🥒', 'Bitter Gourd': '🥒', 'Spinach': '🥬', 'Fenugreek': '🌱', 'Carrot': '🥕',
    'Radish': '🥕', 'Beetroot': '🍠', 'Capsicum': '🫑', 'Peas': '🫛', 'Bottle Gourd': '🍐',
    'Tea': '🍃', 'Coffee': '☕', 'Coconut': '🥥', 'Arecanut': '🌰', 'Banana': '🍌',
    'Mango': '🥭', 'Grapes': '🍇', 'Pineapple': '🍍', 'Papaya': '🥭', 'Watermelon': '🍉',
    'Copra': '🥥', 'Turmeric': '🫚', 'Paddy': '🌾',
    'Ginger': '🫚', 'Coriander': '🌿', 'Cumin': '🍂', 'Black Pepper': '⚫', 'Cardamom': '🍈', 'Clove': '🤎',
    'Sesamum': '🤍', 'Castor seed': '🌰', 'Rubber': '🌳', 'Tobacco': '🍂', 'Jute': '🧶',
    'Apple': '🍎', 'Orange': '🍊', 'Lemon': '🍋'
  };
  return map[name] || '🌱';
};
