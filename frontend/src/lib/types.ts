export type Role = "PB"|"MoF"|"Bank"|"Employer"|"Pensioner";

export type Pensioner = {
  docType: "pensioner";
  nid: string;
  name: string;
  dob: string;
  deptID: string;
  joinDate: string;
  status: "ACTIVE"|"RETIRED"|"SUSPENDED"|"DECEASED";
  accruedFundPaisa: number;
  createdAtUnix: number;
  updatedAtUnix: number;
};
