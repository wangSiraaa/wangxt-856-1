# Trae Preflight

This folder is prepared for `wangxt-856-1`.

Use `.env` for stable local ports and compose project identity:

- APP_PORT: 18156
- API_PORT: 19156
- WEB_PORT: 20156
- DB_PORT: 21156
- REDIS_PORT: 22156

Smoke entry:

```bash
bash scripts/smoke.sh
```

The preflight files are environment scaffolding only. The generated business
project can replace or extend them when needed.
