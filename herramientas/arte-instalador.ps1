# Genera las dos imagenes que admite un instalador MSI (WiX) a partir de la
# lamina de logotipos del instalador:
#   wix-dialog.bmp  493x312  pantallas de bienvenida y final (banda izquierda)
#   wix-banner.bmp  493x58   cabecera del resto de pantallas
# WiX escribe su texto en negro encima de estas imagenes, asi que la zona del
# texto tiene que quedar clara: el arte va a un lado y el resto en blanco.
#
#   powershell -File herramientas\arte-instalador.ps1 -Lamina ruta\lamina.png
param(
  [Parameter(Mandatory = $true)][string]$Lamina,
  [string]$Salida = ''
)

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'
if (-not $Salida) { $Salida = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) '..\src-tauri\installer' }
New-Item -ItemType Directory -Force $Salida | Out-Null
$Salida = (Resolve-Path $Salida).Path
$src = [System.Drawing.Bitmap]::FromFile((Resolve-Path $Lamina).Path)

# Recortes dentro de la lamina de 1024x572 (x, y, ancho, alto), sin los marcos
$banda    = New-Object System.Drawing.Rectangle 42, 53, 178, 481    # «Banda izquierda / Sidebar»
$cabecera = New-Object System.Drawing.Rectangle 269, 53, 713, 93    # «Banda superior / Header»
$cartel   = New-Object System.Drawing.Rectangle 269, 211, 713, 323  # «Rectangular / Banner»

function New-Lienzo([int]$w, [int]$h) {
  $bmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.Clear([System.Drawing.Color]::White)
  return $bmp, $g
}

function Save-Bmp($bmp, $g, [string]$nombre) {
  $g.Dispose()
  $ruta = Join-Path $Salida $nombre
  $bmp.Save($ruta, [System.Drawing.Imaging.ImageFormat]::Bmp)
  $bmp.Dispose()
  "{0}  {1} bytes" -f $ruta, (Get-Item $ruta).Length
}

# --- bienvenida y final: la banda ocupa los 164 px de la izquierda, a toda la altura
$bmp, $g = New-Lienzo 493 312
# La banda es mas esbelta que el hueco. Entra entera, sin deformar y centrada;
# los margenes se rellenan con el color de sus propios bordes, de arriba abajo.
$arriba = $src.GetPixel($banda.X + 3, $banda.Y + 3)
$abajo = $src.GetPixel($banda.X + 3, $banda.Y + $banda.Height - 4)
$fondo = New-Object System.Drawing.Rectangle 0, 0, 164, 312
$relleno = New-Object System.Drawing.Drawing2D.LinearGradientBrush $fondo, $arriba, $abajo, 90.0
$g.FillRectangle($relleno, $fondo)
$ancho = [int]($banda.Width * 312 / $banda.Height)
$destino = New-Object System.Drawing.Rectangle ([int]((164 - $ancho) / 2)), 0, $ancho, 312
$g.DrawImage($src, $destino, $banda, [System.Drawing.GraphicsUnit]::Pixel)
# los cantos de la banda se funden con el relleno
foreach ($lado in 0, 1) {
  $x = if ($lado -eq 0) { $destino.X - 1 } else { $destino.Right - 13 }
  $r = New-Object System.Drawing.Rectangle $x, 0, 14, 312
  $c0 = [System.Drawing.Color]::FromArgb(255, $arriba); $c1 = [System.Drawing.Color]::FromArgb(0, $arriba)
  $ang = if ($lado -eq 0) { 0.0 } else { 180.0 }
  $b = New-Object System.Drawing.Drawing2D.LinearGradientBrush $r, $c0, $c1, $ang
  $g.FillRectangle($b, $r)
}
$pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 43, 140, 255)), 1
$g.DrawLine($pen, 164, 0, 164, 312)
Save-Bmp $bmp $g 'wix-dialog.bmp'

# --- cabecera: el titulo de WiX va a la izquierda en negro; el logotipo, a la derecha
$bmp, $g = New-Lienzo 493 58
$logo = New-Object System.Drawing.Rectangle $cabecera.X, $cabecera.Y, 312, $cabecera.Height   # «weBlogger 1.0» con la pluma
$anchoLogo = [int]($logo.Width * 58 / $logo.Height)
$destino = New-Object System.Drawing.Rectangle (493 - $anchoLogo), 0, $anchoLogo, 58
$g.DrawImage($src, $destino, $logo, [System.Drawing.GraphicsUnit]::Pixel)
# fundido hacia el blanco para que el arte no corte en seco
$rect = New-Object System.Drawing.Rectangle (493 - $anchoLogo - 1), 0, 46, 58
$fade = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::White), ([System.Drawing.Color]::FromArgb(0, 255, 255, 255)), 0.0
$g.FillRectangle($fade, $rect)
Save-Bmp $bmp $g 'wix-banner.bmp'

# --- el cartel grande no cabe en un MSI: se guarda aparte por si se quiere usar en otro instalador
$bmp, $g = New-Lienzo $cartel.Width $cartel.Height
$g.DrawImage($src, (New-Object System.Drawing.Rectangle 0, 0, $cartel.Width, $cartel.Height), $cartel, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$ruta = Join-Path $Salida 'cartel.png'
$bmp.Save($ruta, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$ruta
$src.Dispose()
