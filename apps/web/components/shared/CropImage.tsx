import React from 'react';
import Image from 'next/image';
import { Sprout } from 'lucide-react';

interface CropImageProps {
  cropName: string;
  size?: number;
  className?: string;
}

const CROP_IMAGES: Record<string, string> = {
  'tomato': '/crops/tomato.png',
  'onion': '/crops/onion.png',
  'maize': '/crops/maize.png',
};

export default function CropImage({ cropName, size = 48, className = '' }: CropImageProps) {
  const normalizedName = cropName.toLowerCase().trim();
  const imagePath = CROP_IMAGES[normalizedName];

  if (imagePath) {
    return (
      <div 
        className={`relative overflow-hidden rounded-full border border-border shadow-sm flex items-center justify-center bg-white ${className}`}
        style={{ width: size, height: size }}
      >
        <Image 
          src={imagePath} 
          alt={cropName}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div 
      className={`rounded-full border border-border bg-green-50 text-green-800 flex items-center justify-center shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <Sprout size={size * 0.5} />
    </div>
  );
}
