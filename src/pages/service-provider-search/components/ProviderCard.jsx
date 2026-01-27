import Image from "../../../components/AppImage";
import Button from "../../../components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";

const ProviderCard = ({ provider, onSelect }) => {
  const { t } = useLanguage();

  return (
    <div
      onClick={() => onSelect(provider)}
      className="bg-card rounded-xl border cursor-pointer
                 transition-shadow
                 hover:shadow-lg
                 active:shadow-md"
    >
      {/* Image */}
      <div className="w-full h-44 sm:h-48 overflow-hidden rounded-t-xl">
        <Image
          src={provider.image}
          alt={provider.imageAlt}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-1">
        <h3 className="font-semibold text-base">
          {provider.name}
        </h3>

        <p className="text-sm text-muted-foreground">
          {provider.business}
        </p>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            className="flex-1 h-10 text-sm"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {t?.contact || "Contact"}
          </Button>

          <Button
            className="flex-1 h-10 text-sm"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {t?.bookNow || "Book"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
