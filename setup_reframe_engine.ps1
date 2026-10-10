$ErrorActionPreference = "Stop"

$baseDir = "C:\Users\User\Desktop\Antigravity-Local\scripts\automation"
$venvPath = Join-Path $baseDir "reframe_venv"
$repoPath = Join-Path $baseDir "auto-vertical-reframe"

Write-Host "[*] Iniciando setup do Auto-Vertical-Reframe com correção de Py 3.13..."

if (-Not (Test-Path $repoPath)) {
    Write-Host "[*] Clonando repositório..."
    Set-Location $baseDir
    git clone https://github.com/KazKozDev/auto-vertical-reframe.git
}

Write-Host "[*] Removendo pinning estrito do Mediapipe (Python 3.13 fix)..."
$pyproject = Join-Path $repoPath "pyproject.toml"
if (Test-Path $pyproject) {
    (Get-Content $pyproject) -replace 'mediapipe==0.10.14', 'mediapipe>=0.10.30' | Set-Content $pyproject
}
$requirements = Join-Path $repoPath "requirements.txt"
if (Test-Path $requirements) {
    (Get-Content $requirements) -replace 'mediapipe==0.10.14', 'mediapipe>=0.10.30' | Set-Content $requirements
}

if (-Not (Test-Path $venvPath)) {
    Write-Host "[*] Criando ambiente virtual Python (venv)..."
    Set-Location $baseDir
    python -m venv reframe_venv
}

Write-Host "[*] Instalando dependências (PyTorch CPU e Verthor local)..."
$activateScript = Join-Path $venvPath "Scripts\Activate.ps1"
& powershell -NoProfile -Command "
    . '$activateScript'
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
    pip install -e .\auto-vertical-reframe
"

Write-Host "[OK] Motor de Face Tracking instalado com sucesso (Versão CPU)!"
