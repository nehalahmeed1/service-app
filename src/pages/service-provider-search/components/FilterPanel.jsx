import { X } from "lucide-react";
import Button from "../../../components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";

const FilterPanel = ({
  isOpen = false,
  onClose = () => {},
  onClearFilters = () => {},
}) => {
  const { t } = useLanguage();

  /* ================= MOBILE FULLSCREEN FILTER ================= */
  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col lg:hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">
            {t("filters")}
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Filter options will appear here.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClearFilters}
          >
            {t("clearFilters")}
          </Button>

          <Button
            className="flex-1"
            onClick={onClose}
          >
            {t("apply") ?? "Apply"}
          </Button>
        </div>
      </div>
    );
  }

  /* ================= DESKTOP SIDEBAR FILTER ================= */
  return (
    <aside className="hidden lg:block bg-card p-5 rounded-xl border">
      <h3 className="text-lg font-semibold mb-4">
        {t("filters")}
      </h3>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Filter options will appear here.
        </p>

        <Button
          variant="outline"
          className="w-full"
          onClick={onClearFilters}
        >
          {t("clearFilters")}
        </Button>
      </div>
    </aside>
  );
};

export default FilterPanel;
