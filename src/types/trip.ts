export interface Location {
  id: number;
  type: string;
  name: string;
  region_name: string;
  code: string;
  code_detail: string;
  detailed_name: string;
  lon: number;
  lat: number;
  heading: number;
  zone: Array<{
    latitude: number;
    longitude: number;
  }>;
  atco_code: string;
  has_future_activity: boolean;
  timezone: string;
  area_id?: number;
  google_place_id?: string;
  direction?: string;
  local_name?: string;
  hub_id?: number;
}

export interface Stop {
  id: number;
  departure: {
    scheduled: string;
    actual?: string;
    estimated?: string;
  };
  arrival: {
    scheduled: string;
    actual?: string;
    estimated?: string;
  };
  location: Location;
  allow_boarding: boolean;
  allow_drop_off: boolean;
  booking_cut_off_mins: number;
  pre_booked_only: boolean;
  skipped: boolean;
}

export interface Vehicle {
  wheelchair: number;
  bicycle: number;
  seat: number;
  id: number;
  plate_number: string;
  name: string;
  has_wifi: boolean;
  has_toilet: boolean;
  type: string;
  brand: string;
  colour: string;
  is_backup_vehicle: boolean;
  owner_id: number;
  gps: {
    last_updated: string;
    longitude: number;
    latitude: number;
    heading: number;
  };
  secondary_gps?: {
    last_updated: string;
    longitude: number;
    latitude: number;
    heading: number;
  };
}

export interface Trip {
  route: Stop[];
  vehicle: Vehicle;
  description: {
    route_number: string;
    pattern_id: number;
    calendar_date: string;
    type: string;
    is_cancelled: boolean;
    route_id: number;
  };
}
