import type { Trip } from "../types/trip";

export const mockTrip: Trip = {
  route: [
    {
      id: 1965539,
      departure: {
        scheduled: "2025-06-09T21:10:00+00:00",
        actual: "2025-06-09T21:10:09+00:00",
        estimated: "2025-06-09T21:10:00+00:00",
      },
      arrival: {
        scheduled: "2025-06-09T21:10:00+00:00",
        actual: "2025-06-09T21:07:15+00:00",
        estimated: "2025-06-09T21:10:00+00:00",
      },
      location: {
        id: 218,
        type: "STOP_POINT",
        name: "Dundee Slessor Gardens",
        region_name: "Dundee",
        code: "DUND",
        code_detail: "Dundee",
        detailed_name: "Slessor Gardens",
        lon: -2.966036,
        lat: 56.459319,
        atco_code: "6400LL99",
        has_future_activity: true,
        timezone: "Europe/London",
        zone: [
          {
            latitude: 56.459542218608334,
            longitude: -2.966276800467473,
          },
          {
            latitude: 56.459116641801984,
            longitude: -2.96554414986868,
          },
          {
            latitude: 56.45900595021118,
            longitude: -2.965733748522858,
          },
          {
            latitude: 56.45942485291969,
            longitude: -2.9664919017183045,
          },
          {
            latitude: 56.459542218608334,
            longitude: -2.966276800467473,
          },
        ],
        heading: 135.0,
        area_id: 13,
      },
      allow_boarding: true,
      allow_drop_off: false,
      booking_cut_off_mins: 0,
      pre_booked_only: false,
      skipped: false,
    },
  ],
  vehicle: {
    wheelchair: 1,
    bicycle: 2,
    seat: 53,
    id: 43,
    plate_number: "SG24 UJC",
    name: "Yutong Coach (SG24 UJC)",
    has_wifi: true,
    has_toilet: true,
    type: "coach",
    brand: "Ember",
    colour: "Black",
    is_backup_vehicle: false,
    owner_id: 1,
    gps: {
      last_updated: "2025-06-09T22:11:50.106000+01:00",
      longitude: -2.9795444,
      latitude: 56.4531414,
      heading: 267,
    },
  },
  description: {
    route_number: "E1",
    pattern_id: 37192,
    calendar_date: "2025-06-09",
    type: "public",
    is_cancelled: false,
    route_id: 1,
  },
};
