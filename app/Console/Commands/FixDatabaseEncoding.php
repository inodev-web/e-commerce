<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FixDatabaseEncoding extends Command
{
    protected $signature = 'db:fix-encoding {--dry-run : Run without making changes}';
    protected $description = 'Fix UTF-8 double encoding (Mojibake) in database';

    public function handle()
    {
        $this->info('Starting database encoding fix...');
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->warn('DRY RUN MODE: No changes will be saved.');
        }

        // 1. Text Columns
        $this->fixTable('settings', ['value'], false, $dryRun);
        $this->fixTable('users', ['first_name', 'last_name', 'address'], false, $dryRun);

        // 2. JSON Columns (Translatable & Arrays)
        $this->fixTable('products', ['name', 'description'], true, $dryRun);
        $this->fixTable('categories', ['name'], true, $dryRun);
        $this->fixTable('sub_categories', ['name'], true, $dryRun);
        $this->fixTable('specifications', ['name', 'values'], true, $dryRun);
        
        // 3. Wilayas/Communes (if needed)
        $this->fixTable('wilayas', ['name', 'ar_name'], false, $dryRun);
        $this->fixTable('communes', ['name', 'ar_name'], false, $dryRun);

        $this->info('Database encoding fix completed!');
    }

    private function fixTable($table, $columns, $isJson, $dryRun)
    {
        $this->info("Scanning table: $table");
        
        try {
            $records = DB::table($table)->get();
        } catch (\Exception $e) {
            $this->error("Table $table not found or error accessing it.");
            return;
        }

        $count = 0;
        foreach ($records as $record) {
            $updates = [];
            foreach ($columns as $col) {
                if (!isset($record->$col)) continue;
                
                $original = $record->$col;
                $fixed = null;

                if ($isJson) {
                    $fixed = $this->fixJson($original);
                } else {
                    $fixed = $this->fixString($original);
                }

                if ($fixed !== $original) {
                    $updates[$col] = $fixed;
                    $this->line("  [ID {$record->id}] Fixed $col");
                }
            }

            if (!empty($updates)) {
                $count++;
                if (!$dryRun) {
                    DB::table($table)->where('id', $record->id)->update($updates);
                }
            }
        }
        
        $this->info(" -> Fixed $count records in $table");
    }

    private function fixJson($jsonString)
    {
        if (empty($jsonString)) return $jsonString;

        // Decode associative
        $data = json_decode($jsonString, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            // Not corrupted JSON, seemingly. Or maybe really bad string.
            // If it's not valid JSON, treat as string? 
            // Better safe: try fixing as string if it looks like JSON but failed?
            // Actually, if it fails decode, we can't reliably traverse it.
            // Let's try fixing the raw string and see if it becomes valid JSON
            $fixedRaw = $this->fixString($jsonString);
            if (json_decode($fixedRaw) !== null) {
                return $fixedRaw;
            }
            return $jsonString; // Give up
        }

        // Recursive fix
        $modified = false;
        array_walk_recursive($data, function (&$item) use (&$modified) {
            if (is_string($item)) {
                $fixed = $this->fixString($item);
                if ($fixed !== $item) {
                    $item = $fixed;
                    $modified = true;
                }
            }
        });

        return $modified ? json_encode($data, JSON_UNESCAPED_UNICODE) : $jsonString;
    }

    private function fixString($string)
    {
        if (!is_string($string)) return $string;

        // Heuristic: corrupted strings often contain 'Ã' followed by another char
        // Common double-encoding pattern: UTF-8 interpreted as ISO-8859-1 -> UTF-8
        
        // Check for specific Mojibake markers
        if (strpos($string, 'Ã') !== false) {
             // Try to decode
             $decoded = utf8_decode($string);
             
             // Check if the decoded string is valid UTF-8 and actually different
             // (utf8_decode converts ISO-8859-1 to UTF-8? No, wait.)
             // PHP's utf8_decode converts UTF-8 to ISO-8859-1.
             // Wait.
             // "PurÃ©va" (UTF-8 bytes) -> viewed as ISO-8859-1 chars.
             
             // Actually, if we have double encoded UTF-8, we need to convert it back.
             // The string "PurÃ©va" in the DB is actually valid UTF-8 sequences that REPRESENT "Ã©".
             // We want them to represent "é".
             // "é" in UTF-8 is C3 A9.
             // "Ã" is C3 in (Latin1) and C3 83 in UTF-8.
             // "©" is A9 in (Latin1) and C2 A9 in UTF-8.
             
             // If DB has "Ã©", it has bytes C3 83 C2 A9.
             // We want C3 A9.
             // utf8_decode("Ã©") -> takes UTF-8 string, returns ISO-8859-1.
             // utf8_decode("\xC3\x83\xC2\xA9") -> "\xC3\xA9".
             // This resulting string "\xC3\xA9" is the correct UTF-8 byte sequence for "é".
             // BUT php strings don't have encoding metadata.
             // So $decoded contains bytes C3 A9.
             // To PHP, this is just a string. If we treat it as UTF-8, it is "é".
             
             // So yes, utf8_decode is the correct function to UNWRAP one layer of UTF-8-as-Latin1.
             
             $potentialFix = utf8_decode($string);
             
             // Basic validation: ensure we didn't create invalid UTF-8 (e.g. ? replacements)
             // utf8_decode replaces unknown chars with ?
             if (strpos($potentialFix, '?') === false && mb_check_encoding($potentialFix, 'UTF-8')) {
                 return $potentialFix;
             }
        }

        return $string;
    }
}
