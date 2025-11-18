# Archive Directory

This directory contains code that has been superseded or is no longer actively used, but is kept for reference and potential future use.

## Archive Policy

### Retention Period
- **30 days** - Files are kept in archive for 30 days
- After 30 days, files may be permanently deleted
- Archived files include a timestamp in their directory name

### What Gets Archived

1. **Superseded Code**
   - Old versions of files that have been replaced
   - Duplicate implementations
   - Experimental code that didn't make it to production

2. **Test Files**
   - Old test files that have been replaced by better versions
   - One-off tests that served their purpose
   - Proof-of-concept tests

3. **Documentation**
   - Outdated documentation that has been rewritten
   - Draft versions of specs

### What Does NOT Get Archived

- Active code in use
- Current tests
- Production configuration files
- Git history (use git for historical versions)

## Archive Structure

```
.archive/
├── README.md (this file)
├── YYYY-MM-DD-description/
│   ├── ARCHIVED.md (metadata: what, why, when)
│   └── [archived files]
└── [other dated archives]/
```

## Restoration Process

To restore a file from archive:
1. Review the `ARCHIVED.md` file to understand why it was archived
2. Copy the file back to its original location
3. Update it to work with current codebase if needed
4. Remove from archive or update `ARCHIVED.md`

## Cleanup Process

Files older than 30 days can be deleted:

```bash
# Find archives older than 30 days
find .archive -type d -name "202*" -mtime +30

# Review and delete if appropriate
rm -rf .archive/[old-archive-directory]
```

## Current Archives

<!-- This section is auto-updated by the archival script -->

Last Updated: 2025-11-16
