@echo off
REM ========================================
REM ALKUTBI Frontend Deployment Script
REM ========================================

echo.
echo ========================================
echo   ALKUTBI Frontend Deployment to S3
echo ========================================
echo.

REM Step 1: Build the project
echo [1/3] Building frontend...
echo.
call npm run build

if %errorlevel% neq 0 (
    echo.
    echo ❌ Build failed! Please fix errors and try again.
    pause
    exit /b 1
)

echo.
echo ✅ Build completed successfully!
echo.

REM Step 2: Sync to S3
echo [2/3] Deploying to S3...
echo.

REM Replace YOUR-BUCKET-NAME with your actual S3 bucket name
set BUCKET_NAME=alkutbi-frontend-build

REM Sync the dist folder to S3
aws s3 sync dist s3://%BUCKET_NAME%/ --delete

if %errorlevel% neq 0 (
    echo.
    echo ❌ S3 sync failed! Make sure AWS CLI is configured.
    pause
    exit /b 1
)

echo.
echo Files uploaded to S3 successfully!
echo.

REM Step 3: Invalidate CloudFront cache (if using CloudFront)
echo [3/3] Invalidating CloudFront cache...
echo.

REM Replace YOUR-DISTRIBUTION-ID with your CloudFront distribution ID
REM Comment out these lines if you're not using CloudFront
set DISTRIBUTION_ID=E1TS61669MDBB4

aws cloudfront create-invalidation --distribution-id %DISTRIBUTION_ID% --paths "/*"

if %errorlevel% neq 0 (
    echo.
    echo   CloudFront invalidation failed (skip if not using CloudFront)
) else (
    echo.
    echo  CloudFront cache invalidated!
)

echo.
echo ========================================
echo    Deployment Complete!
echo ========================================
echo.
echo "Your frontend is now live on S3!"
echo.

pause
