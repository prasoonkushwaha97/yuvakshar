# Fix all migrations to add DROP POLICY IF EXISTS before every CREATE POLICY
$migrationDir = "C:\Users\HP\.gemini\antigravity\scratch\yuvakshar\supabase\migrations"

$files = @(
    "029_chaupal_redesign.sql",
    "030_chaupal_feed_schema.sql",
    "031_chaupal_storage.sql",
    "035_media_assets_author_rls.sql"
)

foreach ($file in $files) {
    $path = Join-Path $migrationDir $file
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        # Match CREATE POLICY "name" ON tablename
        # Insert DROP POLICY IF EXISTS "name" ON tablename; before it
        $content = [regex]::Replace($content, 
            'CREATE POLICY "([^"]+)" ON ([^\s]+)',
            { 
                param($m)
                $policyName = $m.Groups[1].Value
                $tableName = $m.Groups[2].Value
                "DROP POLICY IF EXISTS `"$policyName`" ON $tableName;`nCREATE POLICY `"$policyName`" ON $tableName"
            })
        Set-Content -Path $path -Value $content -NoNewline
        Write-Host "Fixed: $file"
    }
}

# Also fix ALTER PUBLICATION which may fail if table already added
$file029 = Join-Path $migrationDir "029_chaupal_redesign.sql"
if (Test-Path $file029) {
    $content = Get-Content $file029 -Raw
    $content = $content -replace 'ALTER PUBLICATION supabase_realtime ADD TABLE', 'ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS'
    Set-Content -Path $file029 -Value $content -NoNewline
    Write-Host "Fixed realtime publication in 029"
}
