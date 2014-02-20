# Typesafe Activator

This project aims to be the snappiest snaptastic snapster you've every snapping laid eyes on!  And by that, we mean it builds stuff.

For more information on using Activator, visit: [http://typesafe.com/activator](http://typesafe.com/activator)

# Activator Developer Documentation

This project uses [SBT 0.13](http://scala-sbt.org).   Make sure you have an SBT launcher, and run it in the checked out directory.


## Running the UI

    sbt> project activator-ui
    sbt> run

or just

    sbt "activator-ui/run"


## Running from the Launcher

1. Stage the distribution:

        sbt stage

2. Force the launcer to use the newly built launcher:

        rm -r ~/.activator

3. Run Activator:

        dist/target/stage/activator


## Testing

There are two types of tests:  Unit tests and integration tests.

### Unit Tests

To run unit tests, simply:

    sbt> test

To run the tests of a particular project, simply:

    sbt> <project>/test

To run a specific test, simply:

    sbt> test-only TestName

## Integration Tests

To run all the integration tests, simply:

    sbt> integration-tests



## Staging a distribution

    sbt> activator-dist/stage

or just

    sbt> stage 

*Note: just stage will also run `activator-ui/stage`*

Generates a distribution in the `dist/target/stage` directory.  This will use a launcher version based on the current git commit id.  To rebuild a new launcher remove your `~/.sbt/boot/scala-*/com.typesafe.activator` directory.

## Building the Distribution

Activator is versioned by either the current git tag or if there isn't a tag, the latest commit hash.  To see the current version that Activator will use for the distribution run:

    sbt show version

To create a distribution optionally create a tag and then run:

    sbt dist

This generates the file `dist/target/universal/typeasafe-activator-<VERSION>.zip`.

Activator auto-checks for new versions so to test a new unreleased version you will need to start Activator with the `-Dactivator.checkForUpdates=false` flag.  If you don't set this Activator will use the latest released version instead of the newly created one.

## Publishing the Distribution

First, make sure your credentials are in an appropriate spot.  For me, that's in `~/.sbt/user.sbt` with the following content:

    credentials += Credentials("Amazon S3", "downloads.typesafe.com.s3.amazonaws.com", <AWS KEY>, <AWS PW>)

Then you can run simply:

    sbt> activator-dist/s3Upload

*OR*

    sbt> s3Upload
    

## Publishing NEWS to versions

First, edit the file `news/news.html` to display the news you'd like within builder.

Then run:

    sbt> news/publish-news <version>


# Issues

If you run into staleness issues with a staged release of Activator, just run `reload` in SBT to regenerate the version number and then run `stage` again.   This should give you a new stable version of SNAP for the sbt-launcher so that the new code is used.   Should only be needed when doing integration tests.
