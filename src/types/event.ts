export type EventStatus = 'upcoming' | 'registration-open' | 'completed';

export type Gender = 'male' | 'female' | 'other';

export interface Distance {
  id: string;
  label: string;
  kilometers: number;
  price: number;
  description?: string;
}

export interface Participant {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  address: string;
  phone: string;
  distanceId: string;
  registeredAt: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  city: string;
  country: string;
  venue: string;
  subtitle?: string;
  description: string;
  bannerImage: string;
  status: EventStatus;
  distances: Distance[];
  participants: Participant[];
}
