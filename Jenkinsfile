pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '20'))
    timeout(time: 45, unit: 'MINUTES')
    timestamps()
  }

  environment {
    CI = 'true'
    NODE_ENV = 'production'
    DOCKER_AVAILABLE = 'false'
  }

  stages {
    stage('Preflight') {
      steps {
        script {
          if (isUnix()) {
            sh 'node --version'
            sh 'npm --version'
          } else {
            bat 'node --version'
            bat 'npm --version'
          }

          try {
            if (isUnix()) {
              sh 'docker --version'
              sh 'docker compose version'
            } else {
              bat 'docker --version'
              bat 'docker compose version'
            }
            env.DOCKER_AVAILABLE = 'true'
            echo 'Docker detected: optional Docker validation stage will run.'
          } catch (Exception err) {
            env.DOCKER_AVAILABLE = 'false'
            echo 'Docker not detected on this Jenkins agent: Docker validation stage will be skipped.'
          }
        }
      }
    }

    stage('Install Dependencies') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm ci --no-audit --no-fund'
          } else {
            bat 'npm ci --no-audit --no-fund'
          }
        }
      }
    }

    stage('Typecheck') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm run typecheck'
          } else {
            bat 'npm run typecheck'
          }
        }
      }
    }

    stage('Contract Tests') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm run test:contracts:docker'
          } else {
            bat 'npm run test:contracts:docker'
          }
        }
      }
    }

    stage('Build (Main Only)') {
      when {
        branch 'main'
      }
      steps {
        script {
          if (isUnix()) {
            sh 'npm run build'
          } else {
            bat 'npm run build'
          }
        }
      }
    }

    stage('Docker Compose Validate (Optional)') {
      when {
        expression { env.DOCKER_AVAILABLE == 'true' }
      }
      steps {
        script {
          if (isUnix()) {
            sh 'docker compose config > compose-resolved.yml'
          } else {
            bat 'docker compose config > compose-resolved.yml'
          }
        }
      }
    }

    stage('Package Website ZIP (Main Only)') {
      when {
        branch 'main'
      }
      steps {
        script {
          if (isUnix()) {
            sh 'npm run zip:website'
          } else {
            bat 'npm run zip:website'
          }
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'deliverables/*.zip,compose-resolved.yml', allowEmptyArchive: true, fingerprint: true
    }
    success {
      echo 'Jenkins CI MVP completed successfully.'
    }
    failure {
      echo 'Jenkins CI MVP failed. Check stage logs for details.'
    }
  }
}
