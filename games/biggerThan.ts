const categoriesES = [
  'General (Cualquier cosa)',
  'Animales',
  'Objetos de casa',
  'Vehículos',
  'Comida',
  'Edificios o monumentos famosos',
  'Naturaleza',
  'Herramientas',
  'Frutas y verduras',
  'Muebles',
  'Instrumentos musicales',
  'Envases y contenedores',
  'Material escolar',
  'Electrodomésticos',
  'Juguetes',
  'Plantas y flores',
  'Objetos de oficina',
];

const categoriesEN = [
  'General (Anything)',
  'Animals',
  'Household objects',
  'Vehicles',
  'Food',
  'Famous buildings or monuments',
  'Nature',
  'Tools',
  'Fruits and vegetables',
  'Furniture',
  'Musical instruments',
  'Containers (Cup, Bucket...)',
  'School supplies',
  'Appliances',
  'Toys',
  'Plants and flowers',
  'Office objects',
];

export const BIGGER_THAN_ICON = '🐭 ➔ 🐘';

export function getBiggerThanPrompt(lang: string = 'es'): string {
  const list = lang.startsWith('es') ? categoriesES : categoriesEN;
  const category = list[Math.floor(Math.random() * list.length)];
  return `${BIGGER_THAN_ICON}\n${category}`;
}
