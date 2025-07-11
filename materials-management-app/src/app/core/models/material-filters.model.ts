import { MaterialType } from "./MaterialType.enum";

export interface MaterialFilters {
  type?: MaterialType;
  purchaseDate?: Date | string;
  cityCode?: string;
  departmentCode?: string;
  page?: number;
  size?: number;
}