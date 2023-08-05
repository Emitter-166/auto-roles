import { Client, Collection, GuildMember, IntentsBitField, Role} from 'discord.js';
import path from 'path';
import { permaRoleIds } from './consts/consts';

require('dotenv').config({
    path: path.join(__dirname, ".env")
})



const F = IntentsBitField.Flags;
const client = new Client({
    intents: [F.Guilds, F.GuildMessages, F.GuildMembers, F.MessageContent]
})


client.once('ready', async (client) => {
    console.log("ready");
    
    // step 2. scan for unverified people and verify them
    setInterval(scanAndGive, 15_000, client);
    // scanAndGive(client);

})

//step 1. add role on join, if missed, step 2. will pick it up
client.on('guildMemberAdd', async member => {
    setTimeout(async () => {
        try{
            await giveAutorolesToMember(member);
         }catch(err: any){
             console.log(`error while trying to give step. 1 autoroles to ${member.user.username}$#${member.user.discriminator}`);
         }
    }, 1_000);
   
})

const giveAutorolesToMember = async (member: GuildMember) => {
    try{
        for(const roleId of permaRoleIds){
            if(member.user.bot){
                await member.roles.remove(roleId, 'autoroles')
                return;
            }
            await member.roles.add(roleId, 'autoroles')
        }
        console.log(`given autoroles to member: ${member.user.username}#${member.user.discriminator}`);
    }catch(err: any){
        console.log(`err on giveRoleToMember() while trying to give roles to ${member.user.username}#${member.user.discriminator}`);
        console.log(err);
        throw new Error(err.message);
    }
}

const scanAndGive = async (client: Client) => {
    const start = Date.now();
    try{
        const guild = await client.guilds.fetch('859736561830592522')
        const members = await guild.members.fetch();

        for(const memberArr of members){
            const member = memberArr[1];
            if(hasMissingRole(permaRoleIds, member.roles.cache)){
                giveAutorolesToMember(member);
            }
        }

    }catch(err: any){
        console.log("Error in scanAndGive()");
        throw new Error(err.message)
    }
    const end = Date.now();

    console.log("\n\n\n Time taken: ", (end - start) / 1000);
    
}




function hasMissingRole(a: string[], b: Collection<string, Role>) {
    const bKeys = new Set(b.keys()); // create a Set of keys from the collection
    for (let i = 0; i < a.length; i++) {
      if (!bKeys.has(a[i])) { // check if string from array a is in the set of keys
        return true;
      }
    }
    return false;
}
  

client.login(process.env._TOKEN);
