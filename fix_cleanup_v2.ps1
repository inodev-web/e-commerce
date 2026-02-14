
$folder = "resources/js"
$extensions = @("*.jsx", "*.js")

# Define replacements using explicit string interpolation
$replacements = @()

# é© -> é
$replacements += @{ Find = "$([char]233)$([char]169)"; Replace = "$([char]233)" }
# è© -> è
$replacements += @{ Find = "$([char]232)$([char]169)"; Replace = "$([char]232)" }
# à© -> à
$replacements += @{ Find = "$([char]224)$([char]169)"; Replace = "$([char]224)" }
# ê© -> ê
$replacements += @{ Find = "$([char]234)$([char]169)"; Replace = "$([char]234)" }
# ô© -> ô
$replacements += @{ Find = "$([char]244)$([char]169)"; Replace = "$([char]244)" }
# î© -> î
$replacements += @{ Find = "$([char]238)$([char]169)"; Replace = "$([char]238)" }
# ç© -> ç
$replacements += @{ Find = "$([char]231)$([char]169)"; Replace = "$([char]231)" }
# ù© -> ù
$replacements += @{ Find = "$([char]249)$([char]169)"; Replace = "$([char]249)" }
# â© -> â
$replacements += @{ Find = "$([char]226)$([char]169)"; Replace = "$([char]226)" }
# ë© -> ë
$replacements += @{ Find = "$([char]235)$([char]169)"; Replace = "$([char]235)" }
# û© -> û
$replacements += @{ Find = "$([char]251)$([char]169)"; Replace = "$([char]251)" }
# ï© -> ï
$replacements += @{ Find = "$([char]239)$([char]169)"; Replace = "$([char]239)" }

# à + NBSP -> à + space
$replacements += @{ Find = "$([char]224)$([char]160)"; Replace = "$([char]224) " }

# Literal matches for missed ones (using UTF8 encoding for script file is required for this to work, but let's rely on chars mostly)
# If script is saved as UTF8, these string literals should work
$replacements += @{ Find = "Ã "; Replace = "à " }


$files = Get-ChildItem -Path $folder -Include $extensions -Recurse

foreach ($file in $files) {
    try {
        $path = $file.FullName
        $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
        $modified = $false

        foreach ($r in $replacements) {
            if ($content.Contains($r.Find)) {
                $content = $content.Replace($r.Find, $r.Replace)
                $modified = $true
            }
        }

        if ($modified) {
            Write-Host "Cleaning artifacts in: $path"
            [System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding $false))
        }
    }
    catch {
        Write-Host "Error processing $path : $_"
    }
}
Write-Host "Cleanup complete"
