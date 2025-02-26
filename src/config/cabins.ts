import { Cabin } from '../types/booking';

export const cabins: Cabin[] = [
  {
    id: 'lying-1',
    name: 'Pirmoji gulima kabina',
    type: 'lying',
    description: 'Aukščiausios klasės gulima kabina su 42UV lempom ir vedinimo sistema',
    image: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&q=80&w=1000',
    pricePerMinute: 0.70
  },
  {
    id: 'lying-2',
    name: 'Antroji gulima kabina',
    type: 'lying',
    description: 'Aukščiausios klasės gulima kabina su aromoterapija ir valdoma muzika',
    image: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&q=80&w=1000',
    pricePerMinute: 0.70
  },
  {
    id: 'standing-1',
    name: 'Stovima kabina',
    type: 'standing',
    description: 'Prabangi stovima kabina su 42UV lempom ir vėdinimo sistema',
    image: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&q=80&w=1000',
    pricePerMinute: 0.70
  }
];