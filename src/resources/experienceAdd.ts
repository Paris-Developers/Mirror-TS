import Enmap from "enmap";
import { UserProfile } from "../slashcommands/Profile";

export const userProfiles= new Enmap('userProfiles');

export function experienceAdd(user: string): void {
    let userProfile: UserProfile = userProfiles.ensure(user, new UserProfile(user));
    userProfile.commandsUsed += 1;
    let today = new Date();
    if(userProfile.lastCommandUsed.getDate() != today.getDate()){
        userProfile.xp += 24;
    }
    else if(userProfile.lastCommandUsed.getHours() != today.getHours()){
        userProfile.xp += 4;
    }
    userProfile.xp += 1;
    userProfile.commandsUsed += 1;
    userProfile.lastCommandUsed = new Date(Date.now());
    userProfiles.set(user, userProfile);
    return;
}