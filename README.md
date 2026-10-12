# password-generator

[English version](README.en.md)

Generator tworzy hasła z wybranych zestawów znaków. Działa w przeglądarce i w Node.js; losowanie opiera na Web Crypto. Każdy włączony zestaw wnosi przynajmniej jeden znak, a na koniec kolejność jest tasowana.

## Jak użyć

Pobierz paczkę wybranego wydania z [Releases](https://github.com/K44DEUSZ/password-generator/releases), a następnie zainstaluj ją w swoim projekcie:

```sh
npm install ./k44deusz-password-generator-1.0.0.tgz
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

## Praca z kodem

Do pracy nad biblioteką użyj Node.js 24. Kod jest w TypeScript; wydania zawierają JavaScript ESM i deklaracje typów.

```sh
npm ci
npm run check
npm test
```

Po poprawnym sprawdzeniu zmian na `main` automat publikuje wydanie. Jeśli numer już istnieje, zwiększa ostatnią część wersji i zapisuje tę zmianę w Git. Paczki są dostępne na GitHubie; nie wymagają konta w rejestrze npm.

## Licencja

MIT. Copyright 2026 Bartosz Golat.
