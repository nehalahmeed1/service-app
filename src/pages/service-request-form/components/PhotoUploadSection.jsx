import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const PhotoUploadSection = ({ photos, onPhotosChange, maxPhotos = 5 }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === 'dragenter' || e?.type === 'dragover') {
      setDragActive(true);
    } else if (e?.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);

    const files = Array.from(e?.dataTransfer?.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e?.target?.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files?.filter(file => file?.type?.startsWith('image/'));
    const remainingSlots = maxPhotos - photos?.length;
    const filesToAdd = imageFiles?.slice(0, remainingSlots);

    const newPhotos = filesToAdd?.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      name: file?.name
    }));

    onPhotosChange([...photos, ...newPhotos]);
  };

  const removePhoto = (photoId) => {
    const updatedPhotos = photos?.filter(photo => photo?.id !== photoId);
    onPhotosChange(updatedPhotos);
  };

  const handleButtonClick = () => {
    fileInputRef?.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-foreground">
            Upload Photos (Optional)
          </label>
          <p className="text-xs text-muted-foreground mt-1">
            Add up to {maxPhotos} photos showing the work needed
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {photos?.length}/{maxPhotos}
        </span>
      </div>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 md:p-8 smooth-transition ${
          dragActive
            ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={photos?.length >= maxPhotos}
        />

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Icon name="Upload" size={28} color="var(--color-primary)" />
          </div>
          <h4 className="font-medium mb-2">
            {photos?.length >= maxPhotos ? 'Maximum photos reached' : 'Drop photos here'}
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse from your device
          </p>
          <Button
            variant="outline"
            onClick={handleButtonClick}
            disabled={photos?.length >= maxPhotos}
            iconName="Image"
            iconPosition="left"
          >
            Choose Photos
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Supported: JPG, PNG, GIF (Max 5MB each)
          </p>
        </div>
      </div>
      {photos?.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {photos?.map((photo) => (
            <div key={photo?.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <Image
                  src={photo?.preview}
                  alt={`Uploaded photo showing service work area - ${photo?.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removePhoto(photo?.id)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-error text-error-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 smooth-transition shadow-lg"
              >
                <Icon name="X" size={16} />
              </button>
              <div className="absolute bottom-2 left-2 right-2 bg-background/90 backdrop-blur-sm rounded px-2 py-1 opacity-0 group-hover:opacity-100 smooth-transition">
                <p className="text-xs truncate">{photo?.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoUploadSection;