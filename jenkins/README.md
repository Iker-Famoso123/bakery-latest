# CI/CD con Jenkins — Repostería Famoso

Jenkins corre **en el Pi** como contenedor, con acceso al socket de Docker.
En cada push valida (CI); al hacer merge a `main`, reconstruye y recrea el stack
de producción (CD). El pipeline vive en el `Jenkinsfile` de la raíz.

## 1. Levantar Jenkins en el Pi

```bash
cd ~/reposteria/jenkins
echo "DOCKER_GID=$(getent group docker | cut -d: -f3)" > .env   # gid del grupo docker
docker compose up -d --build
```

UI en `http://<ip-del-pi>:8083`. Contraseña inicial:

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

En el asistente: **Install suggested plugins**, crea tu usuario admin, y luego
en *Manage Jenkins → Plugins* instala también (si no están):
**Docker Pipeline**, **GitHub Branch Source**, **Pipeline: Multibranch**.

## 2. Credenciales

*Manage Jenkins → Credentials → System → Global → Add Credentials:*

1. **Secret file** · ID **`rf-env-prod`** → sube tu archivo `.env.prod` de producción.
   (Así el secreto no vive en git; el pipeline lo inyecta al desplegar.)
2. Si tu repo es **privado**: un **Username/Password** (o token) con tu PAT de GitHub,
   para que Jenkins pueda clonarlo y registrar el webhook.

## 3. Crear el job (Multibranch Pipeline)

*New Item → Multibranch Pipeline* (nómbralo `reposteria`):

- **Branch Sources → GitHub**: pega la URL del repo y elige la credencial de GitHub.
- **Build Configuration**: by *Jenkinsfile* (raíz) — es el default.
- Guarda. Jenkins escanea las ramas y corre el CI en cada una; `main` además despliega.

## 4. Webhook de GitHub (deploy instantáneo)

Para que GitHub avise a Jenkins, este debe ser alcanzable desde internet:

1. **Expón Jenkins por tu Cloudflare Tunnel**: agrega un Public Hostname
   `jenkins.reposteriafamoso.com` → `http://<ip-del-pi>:8083`.
2. En **GitHub → repo → Settings → Webhooks → Add webhook**:
   - Payload URL: `https://jenkins.reposteriafamoso.com/github-webhook/`
   - Content type: `application/json`
   - Secret: genera uno (`openssl rand -hex 20`) y guárdalo.
   - Eventos: *Just the push event* (o "Send me everything").
3. En Jenkins, *Manage Jenkins → System → GitHub*: agrega el servidor con el
   mismo **secret**, y verifica la conexión.

> ⚠️ **Seguridad:** exponer Jenkins a internet es sensible. Mínimo: contraseña de
> admin fuerte + el secret del webhook. Recomendado: pon **Cloudflare Access**
> (Zero Trust) delante de `jenkins.reposteriafamoso.com`, con una regla que
> **permita sin auth solo la ruta `/github-webhook/`** (para que GitHub entre) y
> pida login para todo lo demás.

## 5. Probar

```bash
git commit --allow-empty -m "ci: probar pipeline" && git push origin main
```
En Jenkins verás el build: **CI (typecheck) → CD (up --build) → smoke test**.

---

### Notas

- **A partir de aquí, Jenkins es quien despliega.** No hagas `docker compose up`
  a mano desde `~/reposteria` con código viejo, o pisarías el deploy. Para operar
  manual, primero `git pull`.
- El stack es el mismo (`name: reposteria-prod`) desde cualquier directorio, así
  que Jenkins recrea tus contenedores y **conserva el volumen** de la base.
- La **primera** corrida construye las imágenes desde cero (lento en ARM); las
  siguientes reutilizan capas y son rápidas.
- Si el build falla, `docker compose up --build` aborta y **producción se queda en
  la versión anterior** (no te deja el sitio caído).
