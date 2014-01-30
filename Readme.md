
# es-cli

  Elastic search CLI for nodejs.

  ![](https://dl.dropboxusercontent.com/u/6396913/misc/Screen%20Shot%202014-01-28%20at%206.46.49%20PM.png)

## Installation

```
$ npm install -g es-cli
```

## Usage

```

  Usage: es [options] [query]

  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -u, --url <url>      elastic search url

```

## Setup

  Since manually specifying `--url` is annoying, you may want to alias this executable:

```
alias logs='es -u <es-url> --index logs --type log'
```

 Allowing you to simply run:

```
$ logs level:error AND hostname:api6-1
```

## Example

Check out the last 10 errors:

```
$ es -u <es-url> level:error
```

Check out the last 1000 events for the users luna and tobi:

```
$ es -u <es-url> user:luna OR user:tobi LIMIT 1000
```

 Limit the number of results and sort:

```
$ es -u <es-url> level:error LIMIT 10 SORT timestamp:desc
```

  Specify the fields to respond with:

```
$ es -u <es-url> level:error FIELDS message
```

# License

  MIT