import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const PortfolioTab = ({ portfolio }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState('all');

  const categories = ['all', ...new Set(portfolio.map(item => item.category))];

  const filteredPortfolio = filter === 'all'
    ? portfolio
    : portfolio?.filter(item => item?.category === filter);

  const openLightbox = (item) => {
    setSelectedImage(item);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {categories?.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium smooth-transition ${
              filter === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {category?.charAt(0)?.toUpperCase() + category?.slice(1)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredPortfolio?.map((item) => (
          <div
            key={item?.id}
            className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-muted cursor-pointer"
            onClick={() => openLightbox(item)}
          >
            <Image
              src={item?.image}
              alt={item?.imageAlt}
              className="w-full h-full object-cover group-hover:scale-110 smooth-transition"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 smooth-transition">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h4 className="text-sm md:text-base font-semibold text-foreground mb-1">
                  {item?.title}
                </h4>
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                  {item?.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                    {item?.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{item?.date}</span>
                </div>
              </div>
            </div>
            <div className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-background/80 rounded-full opacity-0 group-hover:opacity-100 smooth-transition">
              <Icon name="Maximize2" size={16} />
            </div>
          </div>
        ))}
      </div>
      {selectedImage && (
        <div
          className="fixed inset-0 z-[500] bg-background/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-card rounded-full hover:bg-muted smooth-transition"
            onClick={closeLightbox}
          >
            <Icon name="X" size={20} />
          </button>
          <div className="max-w-5xl w-full" onClick={(e) => e?.stopPropagation()}>
            <div className="bg-card rounded-xl overflow-hidden shadow-2xl">
              <div className="aspect-[16/9] bg-muted">
                <Image
                  src={selectedImage?.image}
                  alt={selectedImage?.imageAlt}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-4 md:p-6">
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                  {selectedImage?.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground mb-4">
                  {selectedImage?.description}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {selectedImage?.category}
                  </span>
                  <span className="text-sm text-muted-foreground">{selectedImage?.date}</span>
                  {selectedImage?.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Icon name="MapPin" size={14} />
                      <span>{selectedImage?.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioTab;