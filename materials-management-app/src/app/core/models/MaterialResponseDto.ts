import { City } from "./city.model";
import { MaterialStatus } from "./material-status.enum";
import { MaterialType } from "./MaterialType.enum";

export interface MaterialResponseDto {
  id: number;
  name: string;
  description: string;
  type: MaterialType;
  price: number;
  purchaseDate: string; // LocalDate from backend comes as string
  saleDate?: string | null;
  status: MaterialStatus;
  city: City;
}