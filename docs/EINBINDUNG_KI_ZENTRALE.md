# Wochenplan in die lokale KI-Zentrale einbinden

Diese Datei enthält einen **Übergabeprompt**. Er ist dafür gedacht, in der
Claude-Code-Sitzung eingefügt zu werden, die im Ordner der KI-Zentrale läuft –
also dort, wo der Code der Zentrale liegt.

Hintergrund: Die Zentrale läuft rein lokal (`http://127.0.0.1:8420/#/dashboard`).
Eine Claude-Sitzung in der Cloud kommt an diesen Rechner nicht heran. Deshalb
die Übergabe per Prompt statt direkter Umsetzung.

---

## Prompt zum Kopieren

> Ich möchte eine bereits fertige, eigenständige Web-App in diese KI-Zentrale
> einbinden: unseren **Familien-Wochenplan** (Essensplanung + Einkaufsliste).
>
> **Wo die App liegt**
> - Veröffentlicht und erreichbar: https://daveshave-cloud.github.io/familien-wochenplan/
> - Quellcode: https://github.com/DaveShave-Cloud/familien-wochenplan
> - Branch: `claude/family-meal-planner-app-i8jtl6`
>
> **Was die App technisch ist**
> - React 19 + TypeScript, Vite 8, Tailwind CSS v4
> - Nach `npm run build` eine **rein statische** Seite – kein Server, kein Backend, keine Konten
> - Daten liegen ausschließlich im Browser (IndexedDB über Dexie, Datenbankname `familien-wochenplan`)
> - Als PWA vorbereitet (Manifest, Service Worker, Icons)
> - Der Basispfad ist über die Umgebungsvariable `VITE_BASE` einstellbar,
>   z. B. `VITE_BASE=/apps/wochenplan/ npm run build`
>
> **Der entscheidende Punkt: die Daten hängen an der Adresse.**
> IndexedDB ist an den Origin gebunden. Unsere Familie nutzt die App heute
> unter der oben genannten öffentlichen Adresse – auf iPad und iPhone, mit
> bereits eingetragenen Wochenplänen und bearbeiteten Gerichten.
>
> **Bitte wäge diese drei Wege ab und sag mir, welcher zu dieser Zentrale passt:**
>
> 1. **Kachel mit Link** auf die veröffentlichte Adresse.
>    Daten bleiben erhalten, Mobilgeräte funktionieren weiter, die App
>    aktualisiert sich weiterhin von selbst. Geringster Aufwand.
>
> 2. **iframe** in der Zentrale, der auf die veröffentlichte Adresse zeigt.
>    Sieht integrierter aus. Achtung: Browser schränken Speicher in
>    eingebetteten Fremdseiten ein (Storage Partitioning / Tracking-Schutz) –
>    im schlechten Fall sieht die App im iframe keine der gespeicherten Daten.
>    Bitte prüfen, ob das in dem Browser, in dem die Zentrale läuft, trägt.
>
> 3. **Code in die Zentrale übernehmen** und lokal unter `127.0.0.1:8420`
>    mit ausliefern. Dann ist es *eine* Anwendung, aber: anderer Origin, also
>    sind die bisherigen Daten dort nicht sichtbar (einmaliger Export/Import
>    nötig, die App hat dafür „Daten sichern“ und „Sicherung einspielen“ in den
>    Einstellungen), und die App wäre nur noch auf diesem Rechner nutzbar –
>    iPad und iPhone fielen weg.
>
> **Meine Neigung geht zu Weg 1**, weil wir die App täglich auf dem iPad nutzen.
> Widersprich mir, wenn die Architektur der Zentrale dagegen spricht.
>
> Sieh dir bitte zuerst an, wie in dieser Zentrale bisher Apps registriert werden
> (Konfigurationsdatei, Routen, Kachel-Komponente, …) und schlage die Umsetzung
> vor, bevor du etwas änderst.

---

## Wenn die Zentrale selbst erreichbar werden soll

Die Zentrale läuft bisher nur lokal. Soll sie ebenfalls auf iPad und iPhone
nutzbar sein, bräuchte sie denselben Weg wie der Wochenplan: Build
veröffentlichen (z. B. GitHub Pages), feste Adresse, Homescreen-Symbol.
Der Workflow dieses Projekts unter `.github/workflows/pages.yml` lässt sich
dafür als Vorlage verwenden.
