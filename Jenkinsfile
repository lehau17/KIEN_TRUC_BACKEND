pipeline {
  agent any

  environment {
    COMPOSE_FILE = 'docker-compose-kong.yml'
    DOCKERHUB_CREDS = credentials('dockerhub-creds')
    VPS_SSH_KEY = credentials('vps-ssh-key')
    VPS_USER = 'ubuntu'
    VPS_HOST = '54.254.89.195'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Build & Push Docker') {
      steps {
        sh '''
          echo $DOCKERHUB_CREDS_PSW | docker login -u $DOCKERHUB_CREDS_USR --password-stdin
          docker-compose -f $COMPOSE_FILE build
          docker-compose -f $COMPOSE_FILE push
        '''
      }
    }

    stage('Deploy to VPS') {
      steps {
        sshagent (credentials: ['vps-ssh-key']) {
          sh """
            ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} << 'EOF'
              cd /home/ubuntu/be/KIEN_TRUC_BACKEND
              git pull --rebase origin develop
              docker-compose -f docker-compose-kong.yml pull
              docker-compose -f docker-compose-kong.yml up -d
            EOF
          """
        }
      }
    }
  }
}
