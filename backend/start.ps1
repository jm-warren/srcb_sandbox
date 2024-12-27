# Store original location
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Green
npm --prefix "$projectRoot/frontend" run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed! Please fix the errors and try again." -ForegroundColor Red
    exit $LASTEXITCODE
}

# Only proceed with the rest if build was successful
$distPath = "$projectRoot/frontend/dist"
if (Test-Path $distPath) {
    # Clean up old dist in backend if it exists
    Write-Host "Cleaning up old build..." -ForegroundColor Green
    $staticPath = "$scriptPath/static"
    if (Test-Path $staticPath) {
        Remove-Item -Recurse -Force $staticPath
    }

    # Move dist to backend/static
    Write-Host "Moving build to backend..." -ForegroundColor Green
    Move-Item -Force $distPath $staticPath

    # Start the backend server
    Write-Host "Starting server..." -ForegroundColor Green
    python app.py
} else {
    Write-Host "Dist folder not found! Build may have failed." -ForegroundColor Red
    exit 1
} 