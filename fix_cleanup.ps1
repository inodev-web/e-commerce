
$folder = "resources/js"
$extensions = @("*.jsx", "*.js")

# Helper to get char from int
function C($code) { return [string][char]$code }

# Define replacements
# We look for the character followed by the artifact (© = 169)
$artifact = C(169)

$replacements = @(
    @{ Find = (C(233) + $artifact); Replace = C(233) }, # é© -> é
    @{ Find = (C(232) + $artifact); Replace = C(232) }, # è© -> è
    @{ Find = (C(224) + $artifact); Replace = C(224) }, # à© -> à
    @{ Find = (C(234) + $artifact); Replace = C(234) }, # ê© -> ê
    @{ Find = (C(244) + $artifact); Replace = C(244) }, # ô© -> ô
    @{ Find = (C(238) + $artifact); Replace = C(238) }, # î© -> î
    @{ Find = (C(231) + $artifact); Replace = C(231) }, # ç© -> ç
    @{ Find = (C(249) + $artifact); Replace = C(249) }, # ù© -> ù
    @{ Find = (C(226) + $artifact); Replace = C(226) }, # â© -> â
    @{ Find = (C(235) + $artifact); Replace = C(235) }, # ë© -> ë
    @{ Find = (C(251) + $artifact); Replace = C(251) }, # û© -> û
    @{ Find = (C(239) + $artifact); Replace = C(239) }, # ï© -> ï
    
    # Special cases
    @{ Find = "Ã "; Replace = "à " }, # Convert remaining Ã + space to à + space
    # Clean up any literal "Ã©" that might have been missed if any
    @{ Find = "Ã©"; Replace = "é" },
    @{ Find = "Ã¨"; Replace = "è" }
)

$files = Get-ChildItem -Path $folder -Include $extensions -Recurse

foreach ($file in $files) {
    try {
        $path = $file.FullName
        $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
        $originalContent = $content
        $modified = $false

        foreach ($r in $replacements) {
            if ($content.Contains($r.Find)) {
                $content = $content.Replace($r.Find, $r.Replace)
                $modified = $true
            }
        }

        # Extra Check for NBSP after 'à'
        # à + NBSP (160) -> à + space (32)
        $nbsp = C(160)
        $a_nbsp = C(224) + $nbsp
        if ($content.Contains($a_nbsp)) {
             $content = $content.Replace($a_nbsp, C(224) + " ")
             $modified = $true
        }

        if ($modified) {
            Write-Host "Cleaning artifacts in: $path"
            [System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding $false))
        }
    }
    catch {
        Write-Host "Error: $_"
    }
}
Write-Host "Cleanup done"
