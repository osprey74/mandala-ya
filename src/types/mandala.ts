export interface MandalaCell {
  id: string;
  text: string;
  position: number;
  children: MandalaUnit | null;
  image: string | null;
}

export interface MandalaUnit {
  id: string;
  cells: MandalaCell[];
}

export interface MandalaChart {
  id: string;
  title: string;
  rootUnit: MandalaUnit;
  createdAt: string;
  updatedAt: string;
}
