import { useState } from "react";
import { Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const SearchBar = ({ onSearch = () => {} }) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center">
        {/* Search icon */}
        <Search
          size={18}
          className="absolute left-3 text-muted-foreground"
        />

        {/* Input */}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full pl-10 pr-24 py-3 text-sm border rounded-xl
                     bg-white focus:outline-none focus:ring-2
                     focus:ring-blue-500"
        />

        {/* Search button */}
        <button
          type="submit"
          className="absolute right-2 px-4 py-2 text-sm
                     bg-blue-600 text-white rounded-lg
                     hover:bg-blue-700"
        >
          {t("search")}
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
