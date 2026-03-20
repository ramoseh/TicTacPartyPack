const categoriesES = [
    "General (Cualquier cosa)",
    "Animales",
    "Frutas y Verduras",
    "Países",
    "Marcas",
    "Nombres de persona",
    "Objetos de casa",
    "Ciudades",
    "Profesiones",
    "Comida",
    "Deportes",
    "Colores"
];

const categoriesEN = [
    "General (Anything)",
    "Animals",
    "Fruits and Vegetables",
    "Countries",
    "Brands",
    "Names",
    "Household objects",
    "Cities",
    "Professions",
    "Food",
    "Sports",
    "Colors"
];

export const ALPHABET_ICON = "🔤";

export function getAlphabetPrompt(lang: string = 'es'): string {
    const list = lang.startsWith('es') ? categoriesES : categoriesEN;
    const category = list[Math.floor(Math.random() * list.length)];
    return `${ALPHABET_ICON}\n${category}`;
}
