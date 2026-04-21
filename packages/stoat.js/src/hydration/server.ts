import type { Server as APIServer } from "stoat-api";

import { ReactiveSet } from "@solid-primitives/set";

import type { Hydrate } from "./index.js";

export type HydratedServer = {
  id: string;
  nonce?: string;
  ownerId: string;
  name: string;
  description?: string;
  channelIds: ReactiveSet<string>;
  categories: {
    id: string;
    title: string;
    channels: string[];
  }[];
  systemMessages?: {
    user_joined?: string;
    user_left?: string;
    user_kicked?: string;
    user_banned?: string;
  };
  roles?: Record<
    string,
    {
      name: string;
      permissions: [number, number];
      colour?: string;
      hoist?: boolean;
      rank?: number;
    }
  >;
  defaultPermissions: [number, number];
  iconId?: string;
  bannerId?: string;
  analytics: boolean;
  discoverable: boolean;
  nsfw: boolean;
  tag?: string;
  tagIcon?: string;
};

export const serverHydration: Hydrate<APIServer, HydratedServer> = {
  keyMapping: {
    _id: "id",
    owner: "ownerId",
    default_permissions: "defaultPermissions",
    system_messages: "systemMessages",
  },
  functions: {
    id: (server) => server._id,
    nonce: (server) => server.nonce,
    ownerId: (server) => server.owner,
    name: (server) => server.name,
    description: (server) => server.description || undefined,
    channelIds: () => new ReactiveSet(),
    categories: (server) =>
      (server.categories || []).map((category: any) => ({
        id: category.id,
        title: category.title,
        channels: category.channels,
      })),
    systemMessages: (server) => server.system_messages || undefined,
    roles: (server) => server.roles || undefined,
    defaultPermissions: (server) => server.default_permissions,
    iconId: (server) => server.icon?.id,
    bannerId: (server) => server.banner?.id,
    analytics: (server) => server.analytics || false,
    discoverable: (server) => server.discoverable || false,
    nsfw: (server) => server.nsfw || false,
    tag: (server: any) => server.tag,
    tagIcon: (server: any) => server.tag_icon,
  },
  initialHydration: () => ({
    channelIds: new ReactiveSet(),
  }),
};
