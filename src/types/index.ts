// User types
export interface UserProfile {
  id?: string;
  name: string;
  phone?: string;
  email?: string;
  fcmToken?: string;
  createdAt?: string;
}

// Stand types
export type StandCategory = 'world' | 'russia' | 'services';

export interface Stand {
  id: string;
  name: string;
  description: string;
  category: StandCategory;
  coordinates: Coordinates;
  logo?: string;
  programLink?: string;
}

// Program types
export type ActivityType = 'lecture' | 'masterclass' | 'show' | 'excursion' | 'other';

export interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  zone: string;
  zoneId: string;
  coordinates: Coordinates;
  type: ActivityType;
  image?: string;
}

// Tour types
export type TourismType =
  | 'automotive'
  | 'active'
  | 'ecological'
  | 'wellness'
  | 'beach'
  | 'cruise'
  | 'rural'
  | 'cultural'
  | 'industrial'
  | 'youth'
  | 'patriotic'
  | 'family'
  | 'children';

export interface Tour {
  id: string;
  title: string;
  photo: string;
  description: string;
  region: string;
  country?: string;
  duration: number;
  tourismType: TourismType;
  originalPrice: number;
  discountPercent: number;
  finalPrice: number;
  validFrom: string;
  validTo: string;
  qrCodeUrl: string;
  phone: string;
  bookingUrl: string;
  exhibitorId: string;
  exhibitorLogo?: string;
}

// Excursion types
export interface ExcursionSlot {
  id: string;
  date: string;
  time: string;
  totalSpots: number;
  availableSpots: number;
}

export interface Excursion {
  id: string;
  title: string;
  description: string;
  photo: string;
  meetingPoint: string;
  meetingCoordinates: Coordinates;
  slots: ExcursionSlot[];
}

export interface ExcursionBooking {
  excursionId: string;
  slotId: string;
  name: string;
  phone: string;
  numberOfPeople: number;
}

// FAQ types
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

// Feedback types
export interface FeedbackData {
  rating: number;
  likedAspects: string[];
  customLiked?: string;
  suggestions: string;
  participateInRaffle: boolean;
}

export interface VotingData {
  standId: string;
  phone: string;
}

// Common types
export interface Coordinates {
  lat: number;
  lng: number;
}

// Navigation types
export type RootStackParamList = {
  Welcome: undefined;
  Registration: undefined;
  Main: undefined;
  Map: { standId?: string; filters?: string[] };
  Program: undefined;
  ActivityDetail: { activityId: string };
  Offers: undefined;
  TourDetail: { tourId: string };
  Excursions: undefined;
  ExcursionDetail: { excursionId: string };
  Quest: undefined;
  FAQ: undefined;
  Profile: undefined;
  EditProfile: undefined;
  MySchedule: undefined;
  Favorites: undefined;
  FavoriteStands: undefined;
  Suitcase: undefined;
  Feedback: undefined;
  StandDetail: { standId: string };
  Participants: undefined;
  ParticipantDetail: { participantId: string };
  Activities: undefined;
  ActivityDetail2026: { activityId: string };
  Promotions: undefined;
  PromotionDetail: { promotionId: string };
  TinderSwipe: undefined;
  MyPicks: { accepted?: string[] };
  PromotionClaim: { promotionId: string; promotionName: string };
  MapSearch: undefined;
  MapFilters: undefined;
};

export type BottomTabParamList = {
  ProfileTab: undefined;
  MyScheduleTab: undefined;
  SuitcaseTab: undefined;
  FeedbackTab: undefined;
};

// Zone types
export const ZONES = [
  { id: 'main-stage', name: 'Главная сцена', color: '#2196F3' },
  { id: 'lectory', name: 'Большой Лекторий', color: '#4CAF50' },
  { id: 'retreat', name: 'Ретрит-зона', color: '#9C27B0' },
  { id: 'cinema', name: 'Кинотеатр', color: '#F44336' },
  { id: 'gastro', name: 'Гастрофестиваль', color: '#FF9800' },
  { id: 'action', name: 'Действуй!', color: '#E91E63' },
  { id: 'learn', name: 'Узнавай!', color: '#3F51B5' },
  { id: 'enjoy', name: 'Наслаждайся!', color: '#00BCD4' },
  { id: 'world', name: 'Путешествуй по миру!', color: '#009688' },
  { id: 'russia', name: 'Путешествуй по России!', color: '#FFC107' },
] as const;

export type ZoneId = typeof ZONES[number]['id'];

// Tourism types dictionary
export const TOURISM_TYPES: Record<TourismType, string> = {
  automotive: 'Автомобильный',
  active: 'Активный',
  ecological: 'Экологический',
  wellness: 'Оздоровительный',
  beach: 'Пляжный',
  cruise: 'Круизный',
  rural: 'Сельский',
  cultural: 'Культурно-познавательный',
  industrial: 'Промышленный',
  youth: 'Молодежный',
  patriotic: 'Патриотический',
  family: 'Семейный',
  children: 'Детский',
};

// Festival dates
export const FESTIVAL_DATES = [
  '2026-06-10',
  '2026-06-11',
  '2026-06-12',
  '2026-06-13',
  '2026-06-14',
] as const;

export type FestivalDate = typeof FESTIVAL_DATES[number];

// 2026 API models

export type IslandType = 'deystvuy' | 'otdykhay' | 'uznavay' | 'razvivay';

export interface Zone2026 {
  id: string;
  name: string;
  color: string;
  island_type?: IslandType;
  stand_count?: number;
}

export interface TourismTypeObj {
  id: string;
  name: string;
}

export interface ActivityArea {
  id: string;
  name: string;
}

export interface Country {
  id: string;
  name: string;
}

export interface Region {
  id: string;
  name: string;
}

export interface MacroTerritory {
  id: string;
  name: string;
}

export interface EventSlot {
  id: string;
  date: string;
  time_start: string;
  time_end: string;
}

export interface Participant2026 {
  id: string;
  name: string;
  logo?: string;
  title?: string;
  is_partner: boolean;
  highlight_level?: number;
  role?: 'partner' | 'exponent' | 'subexponent';
  country?: Country;
  macro_territory?: MacroTerritory;
  tourism_types?: TourismTypeObj[];
  activity_areas?: ActivityArea[];
  description?: string;
  link?: string;
  center_point?: Coordinates;
}

export interface StandListResource {
  id: string;
  name: string;
  number?: string;
  zone?: Zone2026;
  participant?: Participant2026;
  tourism_types?: TourismTypeObj[];
  center_point?: Coordinates;
}

export interface StandDetailResource extends StandListResource {
  description?: string;
  promotions?: PromotionListResource[];
  activities?: ActivityListResource[];
}

export interface PromotionListResource {
  id: string;
  name: string;
  photo?: string;
  discount_amount?: string;
  discount_type?: string;
  participant?: Participant2026;
  tourism_type?: TourismTypeObj;
  region?: Region;
  country?: Country;
  is_foreign?: boolean;
  is_favorite?: boolean;
  is_partner?: boolean;
}

export interface PromotionDetailResource extends PromotionListResource {
  description?: string;
  code?: string;
  photos?: string[];
  contacts?: string;
  event_slots?: EventSlot[];
}

export interface ActivityListResource {
  id: string;
  name: string;
  activity_type?: TourismTypeObj;
  event_slots?: EventSlot[];
  participant?: Participant2026;
  is_favorite?: boolean;
}

export interface ActivityDetailResource extends ActivityListResource {
  description?: string;
  registration_link?: string;
  center_point?: Coordinates;
}

export interface SwipeResult {
  promotion_id: string;
  action: 'accept' | 'skip';
}
