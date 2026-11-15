# password-generator

[English version](README.en.md)

Generator tworzy hasła z wybranych zestawów znaków. Działa w przeglądarce i w Node.js; losowanie opiera na Web Crypto. Każdy włączony zestaw wnosi przynajmniej jeden znak, a na koniec kolejność jest tasowana.

Wydanie 1.0.1 zawiera poprawki po audycie i zachowuje dotychczasowe API. Changelog pozostaje w repozytorium i nie trafia do paczki.

## Jak użyć

Pobierz paczkę wybranego wydania z [Releases](https://github.com/K44DEUSZ/password-generator/releases), a następnie zainstaluj ją w swoim projekcie:

```sh
npm install ./k44deusz-password-generator-1.0.1.tgz
```

```ts
import { generatePassword } from "@k44deusz/password-generator";

const password = generatePassword(24, {
  lower: true,
  upper: true,
  numbers: true,
  symbols: true,
});
```

## Co warto wiedzieć

Długość musi być liczbą całkowitą od 1 do 1024 i pomieścić każdy wybrany zestaw. Domyślnie generator używa 24 znaków oraz wszystkich czterech zestawów. Ich zawartość znajdziesz w `characterSets`.

Losowanie odrzuca wartości, które wprowadzałyby nierówny rozkład przy operacji modulo. Wymaga `crypto.getRandomValues`; nie zastępuje go `Math.random`. W przeglądarce użyj HTTPS lub localhost. Gdy źródło losowości nie działa, dostaniesz `PasswordError` z polem `code`.

Obowiązkowy znak z każdego zestawu ogranicza zbiór wyników. Biblioteka nie wylicza entropii i nie obiecuje równomiernego losowania spośród wszystkich możliwych haseł spełniających te warunki.

## API

| Eksport                                                   | Kontrakt                                                                                                                           |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `generatePassword(length = 24, options = defaultOptions)` | Synchronicznie zwraca tekst ASCII o zadanej długości. `length` musi być liczbą całkowitą `1..1024`.                                |
| `PasswordOptions`                                         | Obiekt z czterema wymaganymi polami logicznymi: `lower`, `upper`, `numbers`, `symbols`. Niepusta kombinacja grup jest obowiązkowa. |
| `characterSets`                                           | Zamrożony obiekt z alfabetami każdej grupy. Możesz go odczytywać, nie konfigurować.                                                |
| `defaultOptions`                                          | Zamrożony obiekt, wszystkie cztery grupy włączone. Aby zmienić ustawienia, utwórz kopię.                                           |
| `PasswordError`, `PasswordErrorCode`                      | Klasa błędu rozszerzająca `Error` i unia kodów TypeScript.                                                                         |

Generator wybiera jeden znak z każdej grupy, uzupełnia hasło z połączonego alfabetu i tasuje Fisherem-Yatesem. Każde losowanie indeksu używa odrzucania nadmiarowej części zakresu 32-bitowego. Po 128 odrzuconych próbach pojedynczego indeksu przerywa pracę zamiast zawieszać się na wadliwym źródle. Wyłączone grupy nie pojawiają się w wyniku.

| `PasswordError.code`        | Przyczyna                                                       |
| --------------------------- | --------------------------------------------------------------- |
| `invalid_length`            | Nie-liczba, ułamek albo długość poza limitem.                   |
| `invalid_options`           | Brak wymaganego pola logicznego lub nieprawidłowy typ ustawień. |
| `empty_character_set`       | Wszystkie grupy wyłączone.                                      |
| `length_below_group_count`  | Długość mniejsza od liczby włączonych grup.                     |
| `secure_random_unavailable` | Brak `crypto.getRandomValues`.                                  |
| `random_source_failure`     | Źródło rzuciło wyjątek lub wyczerpało limit prób.               |

Argumenty nie są niejawnie konwertowane. `undefined` w miejscu argumentu używa wartości domyślnej; `null` jest błędnym wejściem.

## Node.js i przeglądarka

Paczka ESM nie wymaga DOM ani frameworka. W Node.js użyj `.mjs` albo `"type": "module"` oraz środowiska udostępniającego globalne Web Crypto. W przeglądarce użyj bundlera lub importu `dist/index.js` jako modułu. Nie ma osobnego eksportu CommonJS. Sama biblioteka nie renderuje interfejsu, nie kopiuje do schowka i nie zapisuje wyniku.

```js
import { generatePassword, defaultOptions, PasswordError } from "@k44deusz/password-generator";

try {
  const password = generatePassword(24, { ...defaultOptions, symbols: false });
  // Przekaż wynik do własnego interfejsu; nie zapisuj haseł w logach.
  password.length; // 24
} catch (error) {
  if (!(error instanceof PasswordError)) throw error;
  // W interfejsie pokaż tłumaczenie kodu i nie zastępuj Web Crypto przez Math.random.
  console.error(error.code);
}
```

## Praca z kodem

Do pracy nad biblioteką użyj Node.js 24. Kod jest w TypeScript; wydania zawierają JavaScript ESM i deklaracje typów.

```sh
npm ci
npm run check
npm test
npm run check:package
```

Push na `main` uruchamia sprawdzenie kodu i testy. Wydanie publikuję osobno przez GitHub Actions, z numerem zapisanym w `package.json`. Automat nie zmienia tego numeru ani nie nadpisuje istniejącego wydania. Opublikowana paczka trafia do narzędzi na stronie po przejściu ich kontroli.

## Licencja

MIT. Copyright 2026 Bartosz Golat.
