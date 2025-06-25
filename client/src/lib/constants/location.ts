import LOCATION from "@/data/location.json";
export interface Province {
  Code: string;
  Name: string;
  NameEn: string;
  FullName: string;
  FullNameEn: string;
  CodeName: string;
  District: District[];
}

export interface District {
  Code: string;
  Name: string;
  NameEn: string;
  FullName: string;
  FullNameEn: string;
  CodeName: string;
  ProvinceCode: string;
  Ward?: Ward[] | null;
}

export interface Ward {
  Code: string;
  Name: string;
  NameEn: string;
  FullName: string;
  FullNameEn: string;
  CodeName: string;
  DistrictCode: string;
}

export const provinces: Province[] = LOCATION;
