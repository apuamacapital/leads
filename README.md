# leads-form-n8n

Formulário estático de captação de leads, publicado no GitHub Pages, que envia os dados para um webhook do n8n.

## Payload enviado (POST, JSON)

```json
{
  "name": "Maria Silva",
  "email": "maria@exemplo.com",
  "phone": "(11) 91234-5678",
  "city": "São Paulo",
  "state": "SP",
  "timestamp": "2026-11-13T18:00:00.000Z",
  "source": "github-pages"
}
```

## Configuração

Os dois arquivos enviam para a **Production URL** do webhook, fixa no código (`WEBHOOK_URL` no topo do script). A Production URL só responde com o workflow **ativo**.

## Publicação

Settings → Pages → Source: *Deploy from a branch* → Branch `main` / `(root)` → Save.
