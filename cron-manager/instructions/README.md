# Cron Job Management

This server has a visual Cron Manager webapp at `/webapps/cron-manager/` for managing scheduled tasks. You can also manage cron jobs via CLI.

## CLI Commands

```bash
crontab -l          # List current user's cron jobs
crontab -e          # Edit cron jobs (opens editor)
crontab -r          # Remove ALL cron jobs (use with caution)
crontab -l -u root  # List root's cron jobs
```

## Cron Schedule Format

```
 ┌───────────── minute (0-59)
 │ ┌───────────── hour (0-23)
 │ │ ┌───────────── day of month (1-31)
 │ │ │ ┌───────────── month (1-12)
 │ │ │ │ ┌───────────── day of week (0-7, 0 and 7 are Sunday)
 │ │ │ │ │
 * * * * * command
```

## Common Patterns

| Schedule | Expression | Description |
|----------|-----------|-------------|
| Every minute | `* * * * *` | Runs every 60 seconds |
| Every 5 minutes | `*/5 * * * *` | Runs at :00, :05, :10, ... |
| Every hour | `0 * * * *` | Runs at the top of every hour |
| Daily at midnight | `0 0 * * *` | Runs once per day at 00:00 |
| Daily at 3 AM | `0 3 * * *` | Good for backups/maintenance |
| Weekly on Sunday | `0 0 * * 0` | Runs at midnight every Sunday |
| Monthly (1st) | `0 0 1 * *` | First day of each month |
| Weekdays at 9 AM | `0 9 * * 1-5` | Monday through Friday |

## Adding a Cron Job via CLI

```bash
# Append a new job (preserves existing jobs)
(crontab -l 2>/dev/null; echo "0 3 * * * /path/to/script.sh") | crontab -

# Replace entire crontab
echo "0 3 * * * /path/to/backup.sh
0 0 * * 0 /path/to/cleanup.sh" | crontab -
```

## Checking Cron Logs

```bash
# Check cron daemon logs
journalctl -u cron --since "1 hour ago"

# Search syslog for cron entries
grep CRON /var/log/syslog | tail -20

# Check if cron service is running
systemctl status cron
```

## Best Practices

1. **Use absolute paths** in commands (`/usr/bin/python3` not `python3`)
2. **Redirect output** to prevent mail buildup: `command >> /var/log/myjob.log 2>&1`
3. **Test commands manually** before adding to crontab
4. **Add comments** above jobs: `# Daily database backup`
5. **Use flock** to prevent overlapping runs: `flock -n /tmp/myjob.lock command`
6. **Set PATH** at the top of crontab if needed: `PATH=/usr/local/bin:/usr/bin:/bin`

## Disabling a Job

Comment out the line with `#` to temporarily disable:
```bash
# 0 3 * * * /path/to/script.sh    (disabled)
```

## Special Strings

Some cron implementations support shorthand:
- `@reboot` — Run once at startup
- `@hourly` — Same as `0 * * * *`
- `@daily` — Same as `0 0 * * *`
- `@weekly` — Same as `0 0 * * 0`
- `@monthly` — Same as `0 0 1 * *`
