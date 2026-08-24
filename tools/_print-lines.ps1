$l = Get-Content $args[0]
$start = [int]$args[1]
$end = [int]$args[2]
for ($i = $start; $i -le $end; $i++) {
  '{0}: {1}' -f $i, $l[$i-1]
}