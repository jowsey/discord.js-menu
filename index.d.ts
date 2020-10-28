// typings by Salvage_Dev (https://github.com/Milo123459)
import { MessageEmbed, TextChannel } from "discord.js";
import { EventEmitter } from 'events';
declare class Page {
    public name: string;
    public content: MessageEmbed;
    public reactions: object;
    public index: number;
    public constructor(name: string, content: MessageEmbed, reactions: object, index: number);
};
declare class Menu extends EventEmitter {
    public channel: TextChannel;
    public userID: string;
    public ms: number;
    public pages: Array<Page>;
    public currentPage: Page;
    public pageIndex: number;
    public constructor(channel: TextChannel, userID: string, pages: Array<Page>, ms?: number): void;
    public start(): void;
    public stop(): void;
    public delete(): void;
    public clearReactions(): void;
    public setPage(page?: number): void;
    public addReactions(): void;
    public awaitReactions(): void;
};
export { Menu };