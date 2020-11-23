# Changelog
All notable changes and updates to this project will be documented in this file.
The file tracks versions using semantic versioning.

## Release Versions
 
## [v2.1.0] (2020-11-23)
### Added
- IP Deny Policy Parameter
    - 'ipdeny' parameter to define blacklisted IP addresses
- CIDR implementation for range of IPs
    - Support for range of IPv4 whitelist and blacklist using CIDR blocks

## [v2.0.0] (2020-11-05)
### Added
- Instructions for piping
    - Uploading judo file to cloud storage using piping
    - Downloading judo file and decrypting secret from cloud storage using piping

### Modified
- Default behavior of judo file and unencrypted file changed to display in STDOUT
- Renaming of existing file as per standard numeric nomenclature

## [v1.7.0] (2020-02-05)
### Added
- Creating a secret
    - Support for IP Whitelist policy parameter
    - Support for Machine name policy parameter
    - Support for Time-To-Live policy parameter
- Retrieving a secret
- Deleting a secret
- Expiring a secret