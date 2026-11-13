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

Na `index.html` (página de teste), cole a **Test URL** e a **Production URL** do nó Webhook do n8n no quadro "Configuração do webhook" e escolha para qual enviar. Os valores ficam salvos no navegador; os padrões estão nas constantes `DEFAULT_TEST_URL` e `DEFAULT_PROD_URL` no topo do script. O `wordpress-snippet.html` usa só a Production URL, fixa no código. A Production URL só responde com o workflow **ativo**.

## Publicação

Settings → Pages → Source: *Deploy from a branch* → Branch `main` / `(root)` → Save.
