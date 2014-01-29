
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

    -h, --help          output usage information
    -V, --version       output the version number
    -u, --url <url>     elastic search url
    -i, --index <name>  index name
    -t, --type <name>   index type
    -n, --max <n>       max number of results [10]

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

Check out events for the users luna and tobi:

```
$ es -u <es-url> user:luna OR user:tobi -n 1000
```

# License

  MIT