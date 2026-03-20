export const SYLLABLES: Record<string, string[]> = {
    es: [
        "EN", "DE", "ER", "ES", "UE", "LA", "RA", "OS", "TA", "QUE",
        "AR", "KU", "EL", "CO", "DO", "RE", "AS", "ON", "AN", "TO",
        "LO", "UN", "OR", "AD", "SE", "CI", "AL", "NA", "SA", "SO",
        "PA", "RO", "NO", "ME", "IN", "MA", "TE", "LI", "PE", "CA",
        "GA", "VE", "SI", "GO", "GE", "JA", "JI", "BO", "MO", "LLE"
    ],
    en: [
        "ING", "ER", "AL", "ED", "ES", "TION", "RE", "DE", "EX", "EN",
        "DI", "COM", "PLE", "CON", "PER", "UN", "DER", "TLE", "BER", "TY",
        "NUM", "BLE", "MENT", "PRO", "AR", "MA", "RI", "SEN", "TURE", "FER",
        "DIF", "PA", "THER", "FORE", "TH", "HE", "AN", "ND", "OU", "AT",
        "IT", "ON", "OR", "VE", "AS", "HI", "ST", "NG", "LE", "LY"
    ]
};

export function getRandomSyllable(lang: string = 'es'): string {
    const list = SYLLABLES[lang] || SYLLABLES.es;
    const index = Math.floor(Math.random() * list.length);
    return list[index];
}
