import Enmap from "enmap";

export const experience = new Enmap('userExperience');

export function experienceAdd(user: string): void {
    let userXP = experience.ensure(user, {xp:0,date:[0,0]});
    let today = new Date();
    if(userXP.date[0] != today.getDate()){
        userXP.xp += 25;
        userXP.date = [today.getDate(),today.getHours()]
        experience.set(user, userXP);
        return;
    }
    if(userXP.date[1] != today.getHours()){
        userXP.xp += 5;
        userXP.date = [today.getDate(),today.getHours()];
        experience.set(user, userXP);
        return
    }
    userXP.xp += 1;
    userXP.date = [today.getDate(),today.getHours()];
    experience.set(user, userXP);
    return;


}