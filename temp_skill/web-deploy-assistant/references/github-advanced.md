# GitHub — Referencia Avanzada

## GitHub Pages

### Opción A: Rama `gh-pages` (deploy manual)
```bash
# Instalar herramienta de deploy
npm install --save-dev gh-pages

# package.json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d out"   // o "build" según framework
  },
  "homepage": "https://usuario.github.io/repo"
}

# Deploy
npm run deploy
```

### Opción B: GitHub Actions (automático en cada push)
```yaml
# .github/workflows/deploy-pages.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Pages
        uses: actions/deploy-pages@v4
```

### Configurar secretos en GitHub
1. Repositorio → Settings → Secrets and variables → Actions
2. New repository secret
3. Agregar: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, etc.

---

## GitHub Actions — CI/CD completo con Vercel

```yaml
# .github/workflows/deploy-vercel.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: ${{ github.ref == 'refs/heads/main' && '--prod' || '' }}
```

---

## Git — Flujo de trabajo profesional

### Conventional Commits (estándar recomendado)
```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formato, no afecta lógica
refactor: refactorización sin nueva funcionalidad
test: agregar o corregir tests
chore: tareas de mantenimiento
```

```bash
# Ejemplos
git commit -m "feat: agregar autenticación con Supabase"
git commit -m "fix: corregir query de paginación"
git commit -m "chore: actualizar dependencias"
```

### Comandos útiles de rescate
```bash
# Ver qué cambió en cada archivo
git diff

# Deshacer último commit (mantiene cambios)
git reset --soft HEAD~1

# Deshacer cambios en un archivo específico
git checkout -- archivo.js

# Guardar cambios temporalmente
git stash
git stash pop

# Ver historial limpio
git log --oneline --graph --all

# Buscar commit por mensaje
git log --grep="login"
```

---

## Protección de ramas y PR workflow

```bash
# GitHub CLI — Crear PR
gh pr create \
  --title "feat: nueva funcionalidad" \
  --body "## Descripción\n\nQué hace este PR..." \
  --base main \
  --head feature/mi-feature

# Ver PRs abiertos
gh pr list

# Revisar PR
gh pr checkout 42

# Merge PR
gh pr merge 42 --squash

# Ver estado de CI
gh run list
gh run watch
```

---

## .gitignore esencial para este stack

```gitignore
# Dependencias
node_modules/
.pnp
.pnp.js

# Build
.next/
out/
dist/
build/

# Variables de entorno — NUNCA commitear
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Supabase local
supabase/.branches
supabase/.temp

# Vercel
.vercel

# Misc
.DS_Store
*.pem
npm-debug.log*
```

---

## Checklist de seguridad pre-deploy

```bash
# Verificar que no hay secretos en el código
git log --all --full-history -- "*.env"
grep -r "supabase.co" src/ --include="*.ts" --include="*.js"

# Verificar .gitignore cubre archivos sensibles
git check-ignore -v .env.local

# Ver archivos siendo trackeados accidentalmente
git ls-files | grep -E "\.(env|key|pem|secret)"
```
