import { City } from "./city.model";
import { MaterialStatus } from "./material-status.enum";

export interface Material {
  id?: number;
  name: string;
  description: string;
  type: string;
  price: number;
  purchaseDate: Date;
  saleDate?: Date;
  status: MaterialStatus;
  city: City;
}