// Library categorization and search inspired by wangzongjun/ScratchJr (https://github.com/wangzongjun/ScratchJr)
import Localization from "../../utils/Localization";

export interface CategoryItem {
    id: string;
    label: string;
}

export interface LibraryMediaItem {
    md5?: string;
    width?: unknown;
    height?: unknown;
    name?: unknown;
    scale?: unknown;
    order?: string;
    altmd5?: unknown;
    category?: string;
    tags?: string[];
}

export default class LibraryEx {
    static getCategories (type: "costumes" | "backgrounds"): CategoryItem[] {
        if (type === "costumes") {
            return [
                { id: "all", label: Localization.localizeWithFallback("LIBRARY_CAT_ALL", "All") },
                { id: "animals", label: Localization.localizeWithFallback("LIBRARY_CAT_ANIMALS", "Animals") },
                { id: "people", label: Localization.localizeWithFallback("LIBRARY_CAT_PEOPLE", "People") },
                { id: "fantasy", label: Localization.localizeWithFallback("LIBRARY_CAT_FANTASY", "Fantasy") },
                { id: "plants", label: Localization.localizeWithFallback("LIBRARY_CAT_PLANTS", "Plants") },
                { id: "nature", label: Localization.localizeWithFallback("LIBRARY_CAT_NATURE", "Nature") },
                { id: "things", label: Localization.localizeWithFallback("LIBRARY_CAT_THINGS", "Things") },
                { id: "vehicles", label: Localization.localizeWithFallback("LIBRARY_CAT_VEHICLES", "Vehicles") },
                { id: "buildings", label: Localization.localizeWithFallback("LIBRARY_CAT_BUILDINGS", "Buildings") }
            ];
        } else {
            return [
                { id: "all", label: Localization.localizeWithFallback("LIBRARY_CAT_ALL", "All") },
                { id: "nature", label: Localization.localizeWithFallback("LIBRARY_CAT_NATURE", "Nature") },
                { id: "city", label: Localization.localizeWithFallback("LIBRARY_CAT_CITY", "City & Outdoors") },
                { id: "indoors", label: Localization.localizeWithFallback("LIBRARY_CAT_INDOORS", "Indoors") },
                { id: "space_water", label: Localization.localizeWithFallback("LIBRARY_CAT_SPACE_WATER", "Space & Undersea") }
            ];
        }
    }

    static getItemCategory (item: LibraryMediaItem, type: "costumes" | "backgrounds"): string {
        if (type === "costumes") {
            const cat = (item.category || "").toLowerCase();
            const order = (item.order || "").toLowerCase();
            const tags = (item.tags || []).join(" ").toLowerCase();
            const combined = cat + " " + order + " " + tags;

            if (combined.indexOf("animal") !== -1) return "animals";
            if (combined.indexOf("family") !== -1 || combined.indexOf("face") !== -1 || combined.indexOf("people") !== -1) return "people";
            if (combined.indexOf("magic") !== -1 || combined.indexOf("funky") !== -1 || combined.indexOf("fantasy") !== -1) return "fantasy";
            if (combined.indexOf("plant") !== -1) return "plants";
            if (combined.indexOf("weather") !== -1 || combined.indexOf("nature") !== -1) return "nature";
            if (combined.indexOf("transportation") !== -1 || combined.indexOf("vehicle") !== -1) return "vehicles";
            if (combined.indexOf("building") !== -1) return "buildings";
            if (combined.indexOf("object") !== -1 || combined.indexOf("thing") !== -1) return "things";
            return "things";
        } else {
            const cat = (item.category || "").toLowerCase();
            const name = String(item.name || "").toLowerCase();
            const tags = (item.tags || []).join(" ").toLowerCase();
            const combined = cat + " " + name + " " + tags;

            const indoors = ["bedroom", "classroom", "empty room", "gym", "library", "theatre", "indoor", "room"];
            if (indoors.some(function (k) { return combined.indexOf(k) !== -1; })) return "indoors";

            const city = ["city", "farm", "park", "suburbs", "house", "school"];
            if (city.some(function (k) { return combined.indexOf(k) !== -1; })) return "city";

            const spaceWater = ["beach", "underwater", "sea", "ocean", "moon", "space", "planet"];
            if (spaceWater.some(function (k) { return combined.indexOf(k) !== -1; })) return "space_water";

            return "nature";
        }
    }

    static filterAssets (
        items: LibraryMediaItem[],
        type: "costumes" | "backgrounds",
        categoryId: string = "all",
        query: string = ""
    ): LibraryMediaItem[] {
        let result = items;

        if (categoryId && categoryId !== "all") {
            result = result.filter(function (item) {
                return LibraryEx.getItemCategory(item, type) === categoryId;
            });
        }

        const trimmed = query.trim().toLowerCase();
        if (!trimmed) {
            return result;
        }

        const terms = trimmed.split(/\s+/).filter(Boolean);
        const scored: Array<{ item: LibraryMediaItem; score: number }> = [];

        for (let i = 0; i < result.length; i++) {
            const item = result[i];
            const name = String(item.name || "").toLowerCase();
            const tags = (item.tags || []).join(" ").toLowerCase();
            const category = (item.category || "").toLowerCase();
            const md5 = (item.md5 || "").toLowerCase();
            const order = (item.order || "").toLowerCase();

            let matchesAll = true;
            let totalScore = 0;

            for (let t = 0; t < terms.length; t++) {
                const term = terms[t];
                if (name === term) {
                    totalScore += 100;
                } else if (name.startsWith(term)) {
                    totalScore += 50;
                } else if (name.indexOf(term) !== -1) {
                    totalScore += 30;
                } else if (tags.indexOf(term) !== -1) {
                    totalScore += 20;
                } else if (category.indexOf(term) !== -1 || order.indexOf(term) !== -1) {
                    totalScore += 10;
                } else if (md5.indexOf(term) !== -1) {
                    totalScore += 5;
                } else {
                    matchesAll = false;
                    break;
                }
            }

            if (matchesAll) {
                scored.push({ item: item, score: totalScore });
            }
        }

        scored.sort(function (a, b) { return b.score - a.score; });
        return scored.map(function (s) { return s.item; });
    }
}
