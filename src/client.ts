import dotenv from 'dotenv';
import { Client } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

import { log, warn, error } from 'src/logging';

import { filterOutFalsy } from 'src/utils';
import commands, { listenToCommands } from 'src/commands';
import events from 'src/events';
import type { IntentionalAny } from 'src/types';

dotenv.config();

const token = process.env.DISCORD_BOT_TOKEN || '';
const clientId = process.env.DISCORD_BOT_CLIENT_ID || '';
const isDev = process.env.ENVIRONMENT === 'development';
const slashCommandsGuildId = process.env.SLASH_COMMANDS_GUILD_ID || '';

export const client = new Client({
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
  intents: [
    'GUILDS',
    'GUILD_BANS',
    'GUILD_MEMBERS',
    'GUILD_PRESENCES',
    'GUILD_MESSAGES',
    'GUILD_MESSAGE_REACTIONS',
    'GUILD_MESSAGE_TYPING',
    'DIRECT_MESSAGES',
    'DIRECT_MESSAGE_REACTIONS',
    'DIRECT_MESSAGE_TYPING',
    'GUILD_VOICE_STATES',
  ],
});

const rest = new REST({ version: '9' }).setToken(token);

export function initClient(): Promise<IntentionalAny> {
  return Promise.all([
    new Promise<void>(resolve => {
      events.forEach(([trigger, cb]) => {
        // @ts-ignore It's really hard to enforce correct types here. Just trust that the EventTrigger type is written correctly.
        client.on(trigger, cb);
      });

      client.on('ready', () => {
        log(`Logged in as ${client.user?.tag} (${client.user?.id})`);
        resolve();
      });
      client.on('warn', warn);
      client.on('error', error);

      listenToCommands();

      client.login(token);
    }),
    (async () => {
      const slashCommands = commands.map(command => {
        const data = command.slashCommandData?.toJSON();
        if (command.runModal && data) {
          data.options = data?.options.map(option => {
            if (option.type === 1) {
              return {
                ...option,
                required: false,
                options: option.options?.map(nestedOption => ({
                  ...nestedOption,
                  required: false,
                })),
              };
            }
            return {
              ...option,
              required: false,
            };
          });
        }
        return data;
      });
      const contextMenus = commands.map(command => command.contextMenuData);
      // TODO: Improve typing
      const body = filterOutFalsy(slashCommands.concat(contextMenus as IntentionalAny));
      if (isDev && slashCommandsGuildId) {
        await rest.put(
          Routes.applicationGuildCommands(clientId, slashCommandsGuildId),
          { body },
        );
        // Delete annoying global commands
        // Comment out if testing slash commands in DMs, since that requires it to be globally registered.
        const globalCommands: IntentionalAny = await rest.get(Routes.applicationCommands(clientId));
        globalCommands?.forEach(async (command: IntentionalAny) => {
          log('Deleting global command', command.id);
          await rest.delete(`${Routes.applicationCommands(clientId)}/${command.id}`);
          log('Deleted global command', command.id);
        });
      } else {
        await rest.put(
          Routes.applicationCommands(clientId),
          { body },
        );
      }
    })(),
  ]);
}

export function destroyClient(): void {
  log('Tearing down client connection');
  client.destroy();
}
