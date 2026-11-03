// Static demo seed data for the public GitHub Pages build.
// Snapshot of the original MockAPI /events resource, bundled so the live demo
// is self-contained and cannot be wiped/vandalised via the unauthenticated
// MockAPI free tier. Typed as Event[] so any shape drift fails the build.
import type { Event } from '../types/event';

export const demoEvents: Event[] = [
  {
    "name": "Mispo Winter Marathon",
    "date": "2026-11-13",
    "city": "Athens",
    "country": "GR",
    "venue": "Panathenaic Stadium",
    "distances": [
      {
        "id": "d1",
        "label": "10 km",
        "kilometers": 10,
        "price": 35
      },
      {
        "id": "d2",
        "label": "Half Marathon",
        "kilometers": 21.1,
        "price": 55,
        "description": "Coastal route, certified by AIMS. Hydration every 3 km."
      },
      {
        "id": "d3",
        "label": "Full Marathon",
        "kilometers": 42.2,
        "price": 80,
        "description": "Original 1896 Olympic route. Strict 6-hour cutoff."
      }
    ],
    "subtitle": "The classic seaside marathon — Athens to Marathon, in reverse.",
    "description": "A historic marathon following the original 490 BC route. Coastal scenery, late-autumn climate, established since 1972.",
    "bannerImage": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800",
    "status": "registration-open",
    "participants": [
      {
        "id": "p1",
        "email": "anna.kowalski@example.com",
        "firstName": "Anna",
        "lastName": "Kowalski",
        "gender": "female",
        "dateOfBirth": "1992-03-14",
        "address": "ul. Słowackiego 12, Warsaw",
        "phone": "48501234567",
        "distanceId": "d2",
        "registeredAt": "2026-05-10T08:32:00Z"
      }
    ],
    "id": "1"
  },
  {
    "name": "Lviv Half",
    "date": "2026-09-21",
    "city": "Lviv",
    "country": "UA",
    "venue": "Rynok Square",
    "distances": [
      {
        "id": "d1",
        "label": "5 km",
        "kilometers": 5,
        "price": 15
      },
      {
        "id": "d2",
        "label": "Half Marathon",
        "kilometers": 21.1,
        "price": 30
      }
    ],
    "subtitle": "",
    "description": "City-centre half marathon through the cobbled Old Town. Flat profile, autumn weather, festival atmosphere.",
    "bannerImage": "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800",
    "status": "registration-open",
    "participants": [],
    "id": "2"
  },
  {
    "name": "Reykjavik Midnight Run",
    "date": "2026-06-21",
    "city": "Reykjavik",
    "country": "IS",
    "venue": "Laugardalur Park",
    "distances": [
      {
        "id": "d1",
        "label": "10 km",
        "kilometers": 10,
        "price": 45,
        "description": "Out-and-back along the harbour."
      },
      {
        "id": "d2",
        "label": "Half Marathon",
        "kilometers": 21.1,
        "price": 70
      }
    ],
    "subtitle": "Solstice run under the midnight sun.",
    "description": "Annual solstice race starting at 22:00. Daylight through the entire course. Volcanic landscape backdrop.",
    "bannerImage": "https://images.unsplash.com/photo-1502904550040-7534597429ae?w=800",
    "status": "registration-open",
    "participants": [],
    "id": "3"
  },
  {
    "name": "Tokyo Spring Marathon",
    "date": "2027-03-07",
    "city": "Tokyo",
    "country": "JP",
    "venue": "Tokyo Metropolitan Government Building",
    "distances": [
      {
        "id": "d1",
        "label": "Full Marathon",
        "kilometers": 42.2,
        "price": 120
      }
    ],
    "subtitle": "",
    "description": "World Marathon Major candidate course. Registration opens Q3 2026.",
    "bannerImage": "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800",
    "status": "upcoming",
    "participants": [],
    "id": "4"
  },
  {
    "name": "Berlin Autumn Run",
    "date": "2025-10-05",
    "city": "Berlin",
    "country": "DE",
    "venue": "Brandenburg Gate",
    "subtitle": "",
    "description": "Annual flat-and-fast certified course. World-record attempts welcome.",
    "bannerImage": "https://images.unsplash.com/photo-1452960962994-acf4fd70b632?w=800",
    "status": "completed",
    "distances": [
      {
        "id": "d1",
        "label": "Half Marathon",
        "kilometers": 21.1,
        "price": 50
      },
      {
        "id": "d2",
        "label": "Full Marathon",
        "kilometers": 42.2,
        "price": 90
      }
    ],
    "participants": [],
    "id": "5"
  },
  {
    "name": "Lisbon Sunset Run",
    "date": "2026-08-14",
    "city": "Lisbon",
    "country": "PT",
    "venue": "Praça do Comércio",
    "distances": [
      {
        "id": "d1",
        "label": "5 km",
        "kilometers": 5,
        "price": 20
      },
      {
        "id": "d2",
        "label": "10 km",
        "kilometers": 10,
        "price": 35,
        "description": "Evening riverside course with sunset views along the Tagus."
      }
    ],
    "subtitle": "Summer evening race through the heart of Lisbon.",
    "description": "Fast urban route with ocean breeze, live music zones, and a sunset finish near the waterfront.",
    "bannerImage": "https://images.unsplash.com/photo-1486218119243-13883505764c?w=800",
    "status": "registration-open",
    "participants": [],
    "id": "6"
  },
  {
    "name": "Oslo Fjord Marathon",
    "date": "2026-09-05",
    "city": "Oslo",
    "country": "NO",
    "venue": "Oslo Opera House",
    "distances": [
      {
        "id": "d1",
        "label": "Half Marathon",
        "kilometers": 21.1,
        "price": 65
      },
      {
        "id": "d2",
        "label": "Full Marathon",
        "kilometers": 42.2,
        "price": 95,
        "description": "Scenic fjord-side route with elevation changes and aid stations every 4 km."
      }
    ],
    "subtitle": "Nordic marathon weekend by the fjord.",
    "description": "A cool-weather race combining city architecture, forest sections, and panoramic waterfront views.",
    "bannerImage": "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800",
    "status": "registration-open",
    "participants": [],
    "id": "7"
  }
];
