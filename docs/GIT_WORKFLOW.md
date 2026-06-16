# Git-Workflow

Dieses Projekt soll so geführt werden, dass mehrere Personen parallel daran arbeiten können.

## Regeln

- Nicht direkt auf `main` arbeiten.
- Neue Arbeit bekommt einen eigenen Branch.
- Branch-Namen folgen dem Muster `codex/<kurze-beschreibung>`.
- Jede größere Änderung bekommt ein Linear-Ticket.
- Vor jedem Push `npm run build` ausführen.
- Pull Requests sollen klein und überprüfbar bleiben.

## Beispiel

```bash
git switch main
git pull
git switch -c codex/secure-auth
```

Änderungen prüfen:

```bash
git status --short
npm run build
```

Commit:

```bash
git add <dateien>
git commit -m "Implement secure private auth"
```

Branch pushen:

```bash
git push -u origin codex/secure-auth
```

Danach auf GitHub einen Pull Request gegen `main` öffnen.

## Aktueller Auth-Branch

Die sichere Authentifizierung wird auf diesem Branch umgesetzt:

```text
codex/secure-auth
```
