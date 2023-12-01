// deno-lint-ignore-file no-explicit-any

import { ProcessMarkdown } from "./mark.js";


type ActionType = {
    priority?: number
}


let actions: any = {};


export function clearActions() {
    actions = {};
}


function getSortedActions() {

    const arr = Object.keys(actions).sort((a, b) => {
        const aa: any = actions[a]?.priority ?? 5;
        const bb: any = actions[b]?.priority ?? 5;
        return (aa - bb);
    });
    return arr;

}


function handleActions(page: any) {

    return [];
}


export function refreshActions(page: any) {
    const buttons = document.querySelector("#btns")!;
    const state = page?.state ?? 'default';
    actions = {...actions, ...handleActions(page)};
    if (state !== 'default') {
        const stateActions = handleActions(page[state]);
        actions = {...actions, ...stateActions};
    }
    const keys = getSortedActions();
    buttons.innerHTML = '';
    for (const key of keys) {
        const btn = document.createElement('button') as HTMLButtonElement;
        if (actions[key].icon) {
            const iconContent = ProcessMarkdown(actions[key].icon);
            btn.innerHTML = iconContent;    
        }
        btn.innerHTML += actions[key].label;
        btn.style.backgroundColor = actions[key].color;
        btn.onclick = actions[key].action;
        btn.title = actions[key].label;
        buttons.appendChild(btn);
    }

}

