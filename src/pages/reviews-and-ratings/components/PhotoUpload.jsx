import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';


const PhotoUpload = ({ photos, onPhotosChange, maxPhotos = 5 }) => {
  const [dragActive, setDragActive] = useState(false);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm md:text-base font-medium text-foreground">
          Add Photos (Optional)
        </label>
        <span className="text-xs md:text-sm text-muted-foreground">
          {photos?.length}/{maxPhotos}
        </span>
      </div>
      {photos?.length < maxPhotos && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-6 md:p-8 text-center smooth-transition ${
            dragActive
              ? 'border-primary bg-primary/10' :'border-border hover:border-primary/50'
          }`}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-muted flex items-center justify-center">
              <Icon name="Upload" size={24} color="var(--color-primary)" />
            </div>
            <div>
              <p className="text-sm md:text-base font-medium text-foreground mb-1">
                Drop photos here or click to upload
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">
                Before/after work photos help others understand your experience
              </p>
            </div>
          </div>
        </div>
      )}
      {photos?.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {photos?.map((photo) => (
            <div key={photo?.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <Image
                  src={photo?.preview}
                  alt={`Uploaded work photo showing ${photo?.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removePhoto(photo?.id)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-error text-error-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 smooth-transition"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;