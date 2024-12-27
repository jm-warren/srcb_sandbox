# Store original location
$originalLocation = Get-Location

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Green
Set-Location "$originalLocation/frontend"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed! Please fix the errors and try again." -ForegroundColor Red
    Set-Location $originalLocation
    exit $LASTEXITCODE
}

# Only proceed with the rest if build was successful
if (Test-Path dist) {
    # Clean up old dist in backend if it exists
    Write-Host "Cleaning up old build..." -ForegroundColor Green
    if (Test-Path "$originalLocation/backend/static") {
        Remove-Item -Recurse -Force "$originalLocation/backend/static"
    }

    # Move dist to backend/static
    Write-Host "Moving build to backend..." -ForegroundColor Green
    Move-Item -Force dist "$originalLocation/backend/static"

    # Start the backend server from original location
    Write-Host "Starting server..." -ForegroundColor Green
    python "$originalLocation/backend/app.py"
} else {
    Write-Host "Dist folder not found! Build may have failed." -ForegroundColor Red
    Set-Location $originalLocation
    exit 1
}