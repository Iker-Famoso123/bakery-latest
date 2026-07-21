// CI/CD — Repostería Famoso.
// CI  (todas las ramas): instala y valida tipos.
// CD  (solo main):       reconstruye y recrea el stack de producción + smoke test.
//
// Requisitos en Jenkins (ver jenkins/README.md):
//   - Correr en el Pi con Docker CLI + Node/pnpm (imagen jenkins/Dockerfile).
//   - Credencial "Secret file" con id `rf-env-prod` = el .env.prod de producción.
//   - Job "Multibranch Pipeline" apuntando al repo de GitHub, con webhook.

pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    timestamps()
    timeout(time: 40, unit: 'MINUTES')
  }

  environment {
    COMPOSE = 'docker compose -f docker-compose.prod.yml --env-file .env.prod'
  }

  stages {
    stage('CI · validar') {
      steps {
        sh 'corepack enable'
        sh 'pnpm install --frozen-lockfile'
        sh 'pnpm typecheck'
      }
    }

    stage('CD · desplegar') {
      when { branch 'main' }
      steps {
        // El .env.prod nunca vive en git: se inyecta desde una credencial de Jenkins.
        withCredentials([file(credentialsId: 'rf-env-prod', variable: 'ENV_PROD')]) {
          sh 'cp "$ENV_PROD" .env.prod'
          sh '$COMPOSE up -d --build'
        }
      }
    }

    stage('CD · smoke test') {
      when { branch 'main' }
      steps {
        sh '''
          # Espera a que la API (que migra al arrancar) responda sana.
          for i in $(seq 1 30); do
            if docker exec rf-api node -e "fetch('http://localhost:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; then
              echo "✔ API healthy"; exit 0
            fi
            sleep 2
          done
          echo "✗ La API no respondió sana"; exit 1
        '''
      }
    }
  }

  post {
    always {
      sh 'rm -f .env.prod || true' // no dejar el secreto en el workspace
    }
    failure {
      echo '❌ Pipeline falló. Si falló el build, producción sigue en la versión anterior.'
    }
    success {
      echo '✅ Pipeline OK.'
    }
  }
}
