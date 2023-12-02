import { ProcessMarkdown } from "./mark.js";
import { parsePathMarkup } from "./lists.js";
import { execute } from './engine.js'
import { handleLists } from "./lists.js";


let actions = {};


export function clearActions() {
    actions = {};
}


function getSortedActions() {

    const arr = Object.keys(actions).sort((a, b) => {
        const aa = a?.priority ?? 5;
        const bb = b?.priority ?? 5;
        return (aa - bb);
    });

    return arr;

}



function parseConditionToken(token, page, story) {
    const obj = token.split('.')[0] ?? undefined;
    let prop = token.split('.')[1] ?? undefined;
    if (obj && prop) {
        page = story[obj];
    } else {
        prop = token;
    }
    if (prop === 'state') {
        const state = page[prop] ?? 'default';
        return state;
    }
    if (page[prop]) {
        return page[prop];
    }
    return token;
}


function singleConditionCheck(token, page, story) {
    const singleRegexCheck = /\((.*)\)/g;
    const matches = [...token.matchAll(singleRegexCheck)][0][1];
    if (matches) {
        token = matches;
    } else {
        throw `Condition not understood: ${token}`;
    }
    const reverse = token.indexOf('!') === 0;
    token = token.replaceAll('!', '');
    const obj = token.split('.')[0];
    let prop = token.split('.')[1];
    if (obj && prop) {
        page = story[obj];
    } else {
        prop = token;
    }
    if (reverse) {
        if (page[prop]) {
            return false;
        }
        return true;
    }
    if (page[prop]) {
        return true;
    }
    return false;
}


function conditionCheck(condition, page, story) {
    const isRegexCheck = /\((.*)\) is \((.*)\)/gm;
    const notRegexCheck = /\((.*)\) not \((.*)\)/gm;
    const isMatch = [...condition.matchAll(isRegexCheck)][0];
    const notMatch = [...condition.matchAll(notRegexCheck)][0];
    if (isMatch && isMatch.length > 0) {
        const left = isMatch[1];
        const right = isMatch[2];
        return parseConditionToken(left, page, story) === parseConditionToken(right, page, story);
    } else if (notMatch && notMatch.length > 0) {
        const left = notMatch[1];
        const right = notMatch[2];
        return parseConditionToken(left, page, story) !== parseConditionToken(right, page, story);
    }
    try {
        return singleConditionCheck(condition, page, story);
    } catch {
        throw `Condition not understood: ${condition}`
    }
}


function setSpecialIcon(possibleIcon) {
    const iconSet = [
        'west',
        'north',
        'south',
        'east',
        'north_west',
        'north_east',
        'south_west',
        'south_east',
        'back_hand',
        'door_open',
        'candle',
        'explosion',
        'map',
        'search',
        'vpn_key',
        'check',
        'cancel',
        'chat',
    ];
    if (possibleIcon === 'use') {
        possibleIcon = 'back_hand';
    }
    if (possibleIcon === 'key') {
        possibleIcon = 'vpn_key';
    }
    if (iconSet.indexOf(possibleIcon) > -1) {
        return `<span class="material-symbols-outlined iconSize">${possibleIcon}</span>`;
    }
    return possibleIcon;
}


function getActionActive(b, page, story) {
    if (!b.active) {
        return true;
    } else {
        return [...b.active].filter(x => conditionCheck(x, page, story)).length > 0;
    }
}


export function refreshActions(page, story) {
    const state = page?.state ?? 'default';
    const buttons = document.querySelector("#btns");
    buttons.innerHTML = '';
    actions = {...actions, ...handleActions(page, story)};
    if (state !== 'default') {
        const stateActions = handleActions(page[state], story);
        actions = {...actions, ...stateActions};
    }
    const keys = getSortedActions();
    for (const key of keys) {
        const btn = document.createElement('button');
        if (actions[key].icon) {
            const iconContent = ProcessMarkdown(actions[key].icon);
            btn.innerHTML = iconContent;    
        }
        btn.innerHTML += actions[key].label;
        btn.style = `background-color: ${actions[key].color};`;
        btn.onclick = actions[key].action;
        btn.alt = actions[key].label;
        buttons.appendChild(btn);
    }
}



function handleActions(page, story) {
    const obj = {};
    if (page.buttons) {
        const buttons = [...page.buttons];
        for (const b of buttons) {
            const label = b?.label ?? undefined;
            const color = b?.color ?? '#111131';
            const icon = b?.icon ?? '';
            const active = getActionActive(b, page, story);
            const action = () => {
                const buttons = document.querySelector("#btns");
                buttons.innerHTML = '';
                actions = {};
                if (b.change) {
                    MergeRecursive(story, b.change);
                }
                const nav = parsePathMarkup(b.go);
                if (nav && story[nav]) {
                    if (b['content']) {
                        bufferText += b['content'];
                        bufferText = handleTemplates(bufferText, page);
                    }
                    const newRoom = story[nav];
                    actions = {};
                    handleLists(story);
                    execute(newRoom);
                } else {
                    handleLists(story);
                    execute();
                    execute(b);    
                }            
            };
            if (label && active) {
                obj[label] = {
                   label: setSpecialIcon(label),
                   icon,
                   color,
                   action,
                }
            }
        }    
    }
    return obj;
}
