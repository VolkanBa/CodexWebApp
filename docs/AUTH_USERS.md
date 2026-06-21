# Auth-Nutzer

Der Login nutzt Benutzername und Passwort. Passwörter werden weiterhin nicht im Repository gespeichert, sondern nur als Argon2-Hashes in `backend/.env`.

## Rollen

- `admin`: darf privaten Bereich öffnen und Admin-APIs verwenden.
- `user`: darf privaten Bereich öffnen, aber keine Admin-APIs verwenden.

## Vorgesehene Nutzer

| Benutzername | Rolle | Herkunft |
| --- | --- | --- |
| `Volle` | `admin` | bestehender Admin-Nutzer |
| `Neo` | `user` | Film / Serie |
| `Leia` | `user` | Film / Serie |
| `Arya` | `user` | Serie |
| `Goku` | `user` | Anime |
| `Luffy` | `user` | Anime |
| `Link` | `user` | Videospiel |
| `Zelda` | `user` | Videospiel |
| `Ezio` | `user` | Videospiel |
| `Tesla` | `user` | historischer Kontext |

## Konfiguration

Der Admin `Volle` nutzt den bestehenden Hash:

```env
PRIVATE_ACCESS_ADMIN_USERNAME=Volle
PRIVATE_ACCESS_PASSWORD_HASH=$argon2id$v=19$...
```

Die weiteren Nutzer werden über `PRIVATE_ACCESS_USERS_JSON` konfiguriert:

```env
PRIVATE_ACCESS_USERS_JSON=[{"username":"Neo","passwordHash":"$argon2id$v=19$...","role":"user"}]
```

Ein leerer `passwordHash` deaktiviert den jeweiligen Nutzer. Das ist in den Beispiel-Dateien Absicht, damit keine unsicheren Standardpasswörter im Repository stehen.

Hash erzeugen:

```bash
node -e "import('argon2').then(async (argon2) => console.log(await argon2.hash(process.argv[1])))" "DEIN_PASSWORT"
```

## Berechtigungen

- `/private` und `GET /private/content`: `admin` und `user`
- `/admin/subjects` und Schreibzugriffe im Hochschul-Admin: nur `admin`
