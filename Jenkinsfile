pipeline {
  agent any

  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '20'))
    disableConcurrentBuilds()
  }

  environment {
    CI = 'true'
    PLAYWRIGHT_BROWSERS_PATH = "${WORKSPACE}\\.pw-browsers"
  }

  parameters {
    string(name: 'RECIPIENT_EMAIL', defaultValue: 'nitesh.iiitm@gmail.com', description: 'Email address for build notifications')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        bat 'node -v'
        bat 'call npm -v'
        bat 'call npm ci'
        bat 'call npx playwright install chromium'
      }
    }

    stage('Execute') {
      steps {
        bat 'call npx playwright test'
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'test-results/results.xml'
        }
      }
    }

    stage('Generate Report') {
      steps {
        bat '''
          if not exist playwright-report\\index.html (
            echo Playwright HTML report was not generated.
            exit /b 1
          )
          echo Playwright HTML report available at playwright-report\\index.html
        '''
      }
      post {
        always {
          archiveArtifacts artifacts: 'playwright-report/**/*,test-results/**/*', fingerprint: true, allowEmptyArchive: true
        }
      }
    }
  }

  post {
    always {
      script {
        def status = currentBuild.currentResult ?: 'SUCCESS'
        def subject = "[Jenkins] JobPortalAutomation #${env.BUILD_NUMBER} - ${status}"
        def body = """
          Project: JobPortalAutomation
          Status: ${status}
          Build: #${env.BUILD_NUMBER}
          Job: ${env.JOB_NAME}
          Build URL: ${env.BUILD_URL}
          Artifacts: ${env.BUILD_URL}artifact/
          Pipeline: Install -> Execute -> Generate Report -> Email
        """

        try {
          emailext(
            subject: subject,
            body: body,
            mimeType: 'text/plain',
            to: params.RECIPIENT_EMAIL,
            attachLog: true,
            attachmentsPattern: 'playwright-report/index.html'
          )
        } catch (err) {
          echo "emailext failed (${err}). Falling back to mail step."
          try {
            mail(
              to: params.RECIPIENT_EMAIL,
              subject: subject,
              body: body
            )
          } catch (mailErr) {
            echo "mail step also failed (${mailErr}). Configure SMTP under Manage Jenkins -> System."
          }
        }
      }
    }

    cleanup {
      cleanWs(deleteDirs: true, notFailBuild: true)
    }
  }
}
