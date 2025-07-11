import { MaterialStatus } from "./material-status.enum";
import { MaterialType } from "./MaterialType.enum";

export interface MaterialRequestDto {
  name: string;
  description: string;
  type: string;
  price: number;
  purchaseDate: string; // Format: YYYY-MM-DD
  saleDate?: string | null; // Format: YYYY-MM-DD
  status: MaterialStatus;
  cityCode: string;
}