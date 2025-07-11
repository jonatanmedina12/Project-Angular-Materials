import { Department } from "./department.model";

export interface City {
  code: string;
  name: string;
  department: Department;
}
