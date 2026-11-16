# Versioning

Polski Daily uses three-part versions: MAJOR.MINOR.PATCH.

| Change | Bump | Example |
|---|---|---|
| Rebuild, or a change that breaks saved progress or how the app is set up | MAJOR | 0.3.0 to 1.0.0 |
| New feature, new lessons or a visible improvement | MINOR | 0.1.0 to 0.2.0 |
| Bug fix, wording or a corrected lesson | PATCH | 0.1.0 to 0.1.1 |

The version must match in three places: `package.json`, the top of `CHANGELOG.md`, and the Current version line in `README.md`. Each release is also published as a GitHub release with the tag `v` plus the version.

Saved progress uses the storage key `polskidaily.v1`. If the saved format changes in a way old data cannot survive, the key changes and the release is a MAJOR bump.
