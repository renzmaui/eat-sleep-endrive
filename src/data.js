// Single source of truth for every Enchin + asset path.
// IDs match the asset filenames (pu-ni, not puni) so every lookup works.

export const ENCHINS = [
  {
    id: 'wonchu',
    name: 'Wonchu',
    papa: 'Jungwon',
    team: 'Team Jungwon',
    color: '#f48fb1',
    ink: '#8a2c50',
  },
  {
    id: 'noxstar',
    name: 'Noxstar',
    papa: 'Jay',
    team: 'Team Jay',
    color: '#9b87f5',
    ink: '#3f2f94',
  },
  {
    id: 'jakey',
    name: 'Jakey',
    papa: 'Jake',
    team: 'Team Jake',
    color: '#f8cf63',
    ink: '#7a5500',
  },
  {
    id: 'snowe',
    name: 'Snowe',
    papa: 'Sunghoon',
    team: 'Team Sunghoon',
    color: '#8ed8ef',
    ink: '#135a70',
  },
  {
    id: 'kishu',
    name: 'Kishu',
    papa: 'Sunoo',
    team: 'Team Sunoo',
    color: '#8ed9b2',
    ink: '#1d6444',
  },
  {
    id: 'pu-ni',
    name: 'Pu-ni',
    papa: 'Ni-ki',
    team: 'Team Ni-ki',
    color: '#f4a36f',
    ink: '#86401a',
  },
];

export const ENCHIN_IDS = ENCHINS.map((e) => e.id);

export const byId = (id) => ENCHINS.find((e) => e.id === id) || null;

export const img = {
  flower: (id) => `img/${id}-flower.webp`,
  intro: (id) => `img/intro-${id}.webp`,
  driver: (id) => `img/mg1driver-${id}.webp`,
  driverPng: (id) => `images/mg1driver-${id}.png`,
  car: (id) => `img/${id}-car.webp`,
  water: (id) => `img/${id}-water.webp`,
  shirt: (id) => `img/${id}-shirt.webp`,
  cap: (id) => `img/${id}-cap.webp`,
  vehicle: 'img/intro-vehicle.webp',
  carTop: 'img/car-topdown.webp',
  carTopPortrait: 'img/car-topdown-portrait.webp',
};

export const video = {
  seatingIntro: { src: 'video/mg1seatingintrovid.mp4', poster: 'video/mg1seatingintrovid-poster.jpg' },
  driverReveal: { src: 'video/driver-reveal.mp4', poster: 'video/driver-reveal-poster.jpg' },
  // Wonchu does not have a final-driver clip yet; the Cutscene falls back to the still image.
  finalDriver: (id) => ({
    src: `video/${id}-final-driver.mp4`,
    poster: `video/${id}-final-driver-poster.jpg`,
    missing: id === 'wonchu',
  }),
};

export const STOPS = [
  { id: 'mg1', num: '01', place: 'Waiting Shed', task: 'Seat the ENCHIN', short: 'Seating' },
  { id: 'mg2', num: '02', place: 'Bus Stop', task: 'Road Trip Quiz', short: 'Quiz' },
  { id: 'mg3', num: '03', place: 'Gas Station', task: 'Pick your look', short: 'Style' },
  { id: 'mg4', num: '04', place: 'The Journey', task: 'Who is driving?', short: 'Journey' },
];

// Every image the game needs, preloaded on the intro screen so nothing pops in later.
export const PRELOAD = [
  img.vehicle,
  img.carTop,
  img.carTopPortrait,
  ...ENCHIN_IDS.flatMap((id) => [
    img.flower(id),
    img.intro(id),
    img.driver(id),
    img.car(id),
    img.water(id),
    img.shirt(id),
    img.cap(id),
  ]),
];
