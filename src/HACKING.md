## Setting up a local dev environment

```
cd /path/to/yangexplains.org/src
```

and create a file named `env_file` with the following content:

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=whatever_you_want
POSTGRES_DB=flaskapp_db
GOOGLE_OAUTH_CLIENT_ID=<redacted>
GOOGLE_OAUTH_CLIENT_SECRET=<redacted>
```

See
[this](https://realpython.com/flask-google-login/#creating-a-google-client)
tutorial for creating a Google oauth app for testing.

Then start the app:

```
docker-compose up
```

The app should now be running on http://localhost:5000 with hot-reloading
of the backend and frontend code enabled.  Now just start hacking!
