# Authentifizierung

Der private Bereich wird serverseitig geschützt. Das Frontend zeigt nur Login- und Statusoberflächen; Passwortprüfung, Session-Erstellung und Zugriffskontrolle liegen im Backend.

## Aktueller Stand

Implementiert:

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /private/content`
- Argon2-Hashprüfung
- httpOnly Session-Cookie
- Rate Limiting für Loginversuche
- Eingabevalidierung mit `zod`

## Benutzername und Passwort

Das Backend erwartet keinen Klartext. Passwörter werden als Argon2-Hash konfiguriert.

Der bestehende Admin-Nutzer heißt:

```env
PRIVATE_ACCESS_ADMIN_USERNAME=Volle
```

Die 9 weiteren Nutzer sind in `docs/AUTH_USERS.md` dokumentiert und werden über `PRIVATE_ACCESS_USERS_JSON` mit Rolle `user` konfiguriert.

Beispiel für lokale Entwicklung:

```bash
node -e "import('argon2').then(async (argon2) => console.log(await argon2.hash(process.argv[1])))" "DEIN_LOKALES_PASSWORT"
```

Den ausgegebenen Hash in `backend/.env` eintragen:

```env
PRIVATE_ACCESS_PASSWORD_HASH=$argon2id$v=19$...
```

Hinweis: Das Passwort selbst nicht committen, nicht in Dokumentation eintragen und nicht im Frontend verwenden.

## Backend-Konfiguration

`backend/.env`:

```env
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000
PRIVATE_ACCESS_ADMIN_USERNAME=Volle
PRIVATE_ACCESS_PASSWORD_HASH=$argon2id$v=19$...
PRIVATE_ACCESS_USERS_JSON=[{"username":"Neo","passwordHash":"","role":"user"}]
SESSION_COOKIE_NAME=private_session
SESSION_COOKIE_SECURE=false
SESSION_TTL_MINUTES=1440
AUTH_RATE_LIMIT_WINDOW_MINUTES=15
AUTH_RATE_LIMIT_MAX=5
```

## Session-Verhalten

- Nach erfolgreichem Login erstellt das Backend eine zufällige Session-ID.
- Die Session-ID wird als `httpOnly` Cookie gesetzt.
- Das Cookie ist für JavaScript im Browser nicht lesbar.
- Lokal und in Docker wird `SESSION_COOKIE_SECURE=false` verwendet, weil die App über `http://localhost` läuft.
- In echter HTTPS-Produktion muss `SESSION_COOKIE_SECURE=true` gesetzt werden, damit das Cookie nur über HTTPS gesendet wird.
- Sessions werden aktuell im Speicher des Backend-Prozesses gehalten.

Wichtige Grenze: Der In-Memory-Session-Store ist für die erste Version geeignet, aber nicht für mehrere Backend-Instanzen oder Neustarts. Für Produktion sollte später Redis, eine Datenbank oder ein anderer zentraler Session-Store genutzt werden.

## Login-Flow

1. Frontend sendet `POST /auth/login` mit `{ "username": "...", "password": "..." }`.
2. Backend validiert die Eingabe.
3. Backend sucht den Nutzer und prüft das Passwort gegen den konfigurierten Argon2-Hash.
4. Backend setzt bei Erfolg ein `httpOnly` Session-Cookie mit Benutzername und Rolle in der serverseitigen Session.
5. Frontend navigiert zu `/private`.
6. `/private` lädt Inhalte über `GET /private/content`.
7. Backend gibt private Inhalte nur bei gültiger Session zurück.

## Logout-Flow

1. Frontend sendet `POST /auth/logout`.
2. Backend löscht die Session aus dem Speicher.
3. Backend löscht das Session-Cookie.
4. Frontend navigiert zurück zum Login.

## Sicherheit

- Keine Passwortprüfung im Frontend.
- Keine Klartext-Passwörter im Repository.
- Keine privaten Inhalte im Frontend hardcoden.
- Login-Endpunkt ist rate-limited.
- API-Eingaben werden validiert.
- Private Endpunkte prüfen die Session serverseitig.
- Admin-Endpunkte verlangen Rolle `admin`.

## Nächste Ausbaustufe

Für Produktion:

- zentraler Session-Store
- echte private Datenquelle
- CSRF-Strategie für komplexere Formulare
- HTTPS-only Deployment
- Monitoring für Login-Fehler und Rate-Limit-Ereignisse
