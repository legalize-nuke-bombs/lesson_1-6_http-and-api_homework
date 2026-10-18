# ДЗ 6. Журнал матчей

Страница показывает мои матчи в Dota 2 из собственного REST API на `json-server` и добавляет новый матч через форму.

Ресурс: `matches`

Endpoint: `http://localhost:3000/matches`

Поля матча:

- `hero`: герой, строка
- `isWin`: победа или поражение, `true` или `false`
- `kills`, `deaths`, `assists`: убийства, смерти и помощь, числа
- `durationMinutes`: длительность матча в минутах, число

## Запуск

Понадобятся Node.js `22.12` или новее, npm и VS Code с расширением Live Server.

Терминал для API:

```bash
cd backend
npm ci
npm run dev
```

После запуска список открывается напрямую по адресу `http://localhost:3000/matches`.

Frontend:

1. Откройте `frontend/index.html` в VS Code.
2. Запустите **Open with Live Server**.
3. Страница сама загрузит матчи, новый матч добавляется формой справа.
