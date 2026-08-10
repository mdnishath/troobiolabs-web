# WP-CLI wrapper for the Local site "wp-connector"
# Usage: .\scripts\wp.ps1 <wp-cli args...>
$php = "C:\Users\nishath\AppData\Roaming\Local\lightning-services\php-8.2.29+0\bin\win64\php.exe"
$ini = "C:\Users\nishath\AppData\Roaming\Local\run\5cKg0Br_B\conf\php\php.ini"
$phar = "C:\Users\nishath\AppData\Local\Programs\Local\resources\extraResources\bin\wp-cli\wp-cli.phar"
$site = "C:\Users\nishath\Local Sites\wp-connector\app\public"
& $php -c $ini -d error_reporting=0 -d display_errors=0 $phar --path=$site @args
