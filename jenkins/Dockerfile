# Jenkins para el Pi, con lo que necesita el pipeline:
#   - Docker CLI + plugin de compose (para desplegar contra el socket del host)
#   - Node 22 + pnpm (para la etapa de CI: install + typecheck)
FROM jenkins/jenkins:lts-jdk21

USER root

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl gnupg \
 && install -m 0755 -d /etc/apt/keyrings \
 && curl -fsSL https://download.docker.com/linux/debian/gpg \
      | gpg --dearmor -o /etc/apt/keyrings/docker.gpg \
 && chmod a+r /etc/apt/keyrings/docker.gpg \
 && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
      > /etc/apt/sources.list.d/docker.list \
 && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
 && apt-get update \
 && apt-get install -y --no-install-recommends \
      docker-ce-cli docker-compose-plugin nodejs \
 && corepack enable \
 && rm -rf /var/lib/apt/lists/*

USER jenkins
