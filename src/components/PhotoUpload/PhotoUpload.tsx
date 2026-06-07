import React, { useRef } from 'react';
import { Camera, X, Image as ImageIcon } from 'lucide-react';
import { GaugePosition, POSITION_LABELS, PhotoInfo } from '../../types';
import { cn } from '../../lib/utils';

interface PhotoUploadProps {
  position: GaugePosition;
  photo?: PhotoInfo;
  onUpload: (photo: PhotoInfo) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  position,
  photo,
  onUpload,
  onRemove,
  disabled,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const label = POSITION_LABELS[position];

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        onUpload({
          position,
          url,
          uploadedAt: new Date().toISOString(),
        });
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-gray-600 text-center">{label}照片</p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />
      {photo ? (
        <div className="photo-uploaded group">
          <img
            src={photo.url}
            alt={`${label}水尺照片`}
            className="w-full h-full object-cover"
          />
          {!disabled && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={handleClick}
                className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                title="重新拍摄"
              >
                <Camera className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={onRemove}
                className="p-2 bg-danger-500 rounded-full hover:bg-danger-600 transition-colors"
                title="删除照片"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          )}
          <div className="absolute bottom-1 right-1 px-2 py-0.5 bg-black/60 text-white text-xs rounded">
            ✓ 已上传
          </div>
        </div>
      ) : (
        <button
          onClick={handleClick}
          disabled={disabled}
          className={cn(
            'photo-placeholder',
            disabled && 'opacity-50 cursor-not-allowed hover:border-gray-300 hover:bg-transparent'
          )}
        >
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Camera className="w-6 h-6 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">点击上传照片</p>
            <p className="text-xs text-gray-400">或拍摄{label}水尺</p>
          </div>
          <ImageIcon className="w-4 h-4 absolute top-2 right-2 opacity-50" />
        </button>
      )}
    </div>
  );
};
