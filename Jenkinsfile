pipeline {
    agent any

    tools {
        nodejs 'NodeJS_25'
    }

    environment {
        // 이미지 및 컨테이너 이름 변수 설정
        IMAGE_NAME = "image-resize-api"
        CONTAINER_NAME = "image-resize-api-container"
        PORT = "3000"
    }
    
    stages {
        stage('Build Artifacts') {
            steps {
                echo 'Building application on Jenkins...'
                sh "pnpm install --frozen-lockfile"
                sh "pnpm run build" 
                // 결과: Jenkins 작업 공간에 ./dist 폴더 생성 완료
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Packaging into Docker Image...'
                // Dockerfile의 "COPY ./dist /app/dist" 부분이 여기서 실행됨
                sh "docker build -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying the application...'
                // Add deployment commands here
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check the logs.'
        }
    }
}