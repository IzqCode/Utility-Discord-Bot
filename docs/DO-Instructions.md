# Hosting it on a Digital Ocean Droplet

These instructions describe a process for manually hosting the bot on a Digital Ocean Droplet. This will not have automated deployments.

These instructions do not mention how to gather your environment variables. You can see the structure of the `.env` file [here](../README.md#environment-variables) and instructions on how to gather them in the [Heroku instructions](./Heroku-Instructions.md).

These instructions also assume you have created a PostgreSQL database on Heroku, as instructed in the [Heroku instructions](./Heroku-Instructions.md). Even if you do not want to host the bot on Heroku, you probably want to utilize Heroku's free PostgreSQL database. It's recommended to go through the Heroku instructions, create your Heroku app with the database, then disable the dyno and proceed to host the bot on the VM described here.

## Startup:

1. Choose a Linux distrubution, e.g. Ubuntu. The supported platforms are `linux/amd64`, `linux/arm64`, and `linux/arm/v7`. The rest of the instructions assume you chose **Ubuntu**.
1. For the cheapest viable option, choose a shared CPU (Basic), with the cheaper processor and no volumes. Choose whatever datacenter you want, leave the VPC network to default, and preferrably use SSH keys for authentication (follow their instructions). You won't need to manually SSH into the droplet, so adding authentication is optional.
1. Click on your droplet, go to Access and then click "Launch Droplet Console" to connect your droplet on the web. You can SSH into your droplet manually if you want, but this is unnecessary work.
1. Assuming you chose Ubuntu for your distribution, Git will already be installed and you will have access to `apt`. If you use another distribution, you may need to install this software in different ways (e.g. your distribution may not have APT). At the end of the day, you need to have Docker installed and running. NPM and Git are optional, but they allow you to conveniently run scripts from the Git repo. So we will make sure all three are installed.
   ```
   apt install docker.io npm
   ```
1.  As previously mentioned, this is optional, but useful. If you skip this step, you must replace `npm run ...` in all future steps with whatever that script actually does.
    ```
    git clone https://github.com/mikeyaworski/Utility-Discord-Bot.git
    cd Utility-Discord-Bot
    ```
1.  Pull the latest Docker image.
    ```
    cd ~/Utility-Discord-Bot
    npm run docker-pull
    ```
    Or, if you want to use a specific Docker image (other than `latest`), find the tag from https://hub.docker.com/repository/docker/mikeyaworski/utility-discord-bot and use this command, where `...` is the tag you want to use:
    ```
    docker pull mikeyaworski/utility-discord-bot:...
    ```
    If you are wanting to use a specific tag, you will also need to update the `start:docker` script to use that tag.
1.  Retrieve your `DATABASE_URL` environment variable with:
    ```
    heroku config:get DATABASE_URL -a miky-utility-discord-bot
    ```
    Where `miky-utility-discord-bot` is replaced to whatever your Heroku app is named. Note that this value is subject to change. When/if it changes, you will need to update the environment variable and restart the app.

    As previously mentioned, these instructions assume you have gone through the [Heroku instructions](./Heroku-Instructions.md) to create a Heroku app with a free PostgreSQL database.
1.  Create a `.env` file with all of the environment variables filled in. This means your secrets are written to the instance's disk. If this is a security concern for you, then there are alternative ways to define secrets, but are more effort.

    You can see the structure of the `.env` file [here](../README.md#environment-variables) and instructions on how to gather the environment variables in the [Heroku instructions](./Heroku-Instructions.md).

    If unfamiliar with the command line, here are instructions to create the `.env` file using vim:

    1. Create it on your local computer and copy the contents of the file.
    1. In your SSH session, run `vi .env` (make sure you are inside the `Utility-Discord-Bot` folder).
    1. Press `i` to enter Insert mode
    1. Paste. This pastes the content of the `.env` file. If on Windows WSL, you may need to right click your WSL bar, click Properties and check "Use Ctrl+Shift+C/V as Copy/Paste" first. And then use `Ctrl + Shift + V` to paste.
    1. Type `:x` to save and quit.

    You can use something like nano instead of vim if you struggle with the instructions above.
1.  Start the bot:
    ```
    npm run start:docker
    ```
1. View logs to see if everything is successful:
   ```
   npm run logs:docker
   ```
   Use `Ctrl + C` to get out of the logs.

## Restarting

```
cd ~/Utility-Discord-Bot
npm run restart:docker
```

## Updating:

```
cd ~/Utility-Discord-Bot
npm run docker-pull
npm run restart:docker
```

## Stopping:

```
cd ~/Utility-Discord-Bot
npm run stop:docker
```

## Reading Logs

```
cd ~/Utility-Discord-Bot
npm run logs:docker
```
Use `Ctrl + C` to get out of the logs.