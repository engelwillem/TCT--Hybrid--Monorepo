import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { POST_COMPOSER_TYPES, type PostType } from "../post-composer/types";
import type { ComposerAnalyticsFilters, ComposerAnalyticsMediaFilter, ComposerAnalyticsTimeframe } from "../../analytics/types";

type ComposerAnalyticsFiltersProps = {
  value: ComposerAnalyticsFilters;
  onChange: (next: ComposerAnalyticsFilters) => void;
};

export function ComposerAnalyticsFilters({ value, onChange }: ComposerAnalyticsFiltersProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Select
        value={value.timeframe}
        onValueChange={(next) =>
          onChange({
            ...value,
            timeframe: next as ComposerAnalyticsTimeframe,
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Timeframe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">7 hari</SelectItem>
          <SelectItem value="30d">30 hari</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={value.postType}
        onValueChange={(next) =>
          onChange({
            ...value,
            postType: next as PostType | "all",
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Post Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua tipe</SelectItem>
          {POST_COMPOSER_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.media}
        onValueChange={(next) =>
          onChange({
            ...value,
            media: next as ComposerAnalyticsMediaFilter,
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Media" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua media</SelectItem>
          <SelectItem value="with_media">Dengan media</SelectItem>
          <SelectItem value="without_media">Tanpa media</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
