# How to run on Google Compute Engine

These instructions describe a process for manually hosting the bot on GCE. This will not have automated deployments.

Note: These instructions were written before Docker images were created for this project. Check the AWS instructions to get a general idea of how to run a Docker container instead.

## Startup:

1. Create a VM instance under the Google Compute Engine.
1. Use an `e2-micro` instance in a free region if you want to remain in the free tier. For example, the `us-central1` region.
1. (Optional) Choose an Ubuntu machine (latest version).
1. SSH into the instance.
1. 
   ```
   sudo apt update
   ```
1. 
   ```
   sudo apt install python ffmpeg
   ```
1. 
   ```
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo bash -
   ```
1. 
   ```
   sudo apt install -y nodejs
   ```
1.  
    ```
    git clone https://github.com/mikeyaworski/Utility-Discord-Bot.git
    ```
1. 
    ```
    cd ~/Utility-Discord-Bot
    ```
1. 
    ```
    npm ci`
1. Retrieve your `DATABASE_URL` environment variable with:
    ```
    heroku config:get DATABASE_URL -a miky-utility-discord-bot
    ```
    Note that this value is subject to change. When/if it changes, you will need to update the environment variable and restart the app.
1. Create a `.env` file with all of the environment variables filled in. This means your secrets are written to the instance's disk. If this is a security concern for you, then there are alternative ways to define secrets, but are more effort.
1. 
    ```
    npm run start:nohup
    ```

## Restarting

```
cd ~/Utility-Discord-Bot
npm run stop:nohup
npm run start:nohup
```

## Updating:

```
cd ~/Utility-Discord-Bot
git pull
```

If there are dependency changes, then you will need to stop the app, update the dependencies, and run it again.

```
npm run stop:nohup
npm ci
npm run start:nohup
```

## Stopping:

```
cd ~/Utility-Discord-Bot
npm run stop:nohup
```

Or find the node process and kill it (using its PID).

```
ps -ef | grep "[b]in/ts-node"
kill -9 ...
```

## Reading Logs

```
cd ~/Utility-Discord-Bot
cat log
```

# TODOs

1. Build this VM from an image.