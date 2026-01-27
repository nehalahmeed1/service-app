import Icon from "../../../components/AppIcon";
import Select from "../../../components/ui/Select";
import { useLanguage } from "@/context/LanguageContext";

const SortControls = ({ sortBy, onSortChange }) => {
  const { t } = useLanguage();

  const sortOptions = [
    { value: "distance", label: t("nearestFirst") },
    { value: "rating", label: t("highestRated") },
    { value: "availability", label: t("availableNow") },
    { value: "reviews", label: t("mostReviewed") },
  ];

  return (
    <div className="flex items-center justify-between gap-3 bg-card p-4 rounded-xl border">
      {/* Left: icon + label */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon name="SlidersHorizontal" size={18} />
        <span>{t("sortAndView")}</span>
      </div>

      {/* Right: select */}
      <Select
        options={sortOptions}
        value={sortBy}
        onChange={onSortChange}
        placeholder={t("sortBy")}
      />
    </div>
  );
};

export default SortControls;
