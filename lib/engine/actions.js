import { ProcessMarkdown } from "./mark.js";
import { parsePathMarkup } from "./lists.js";
import { execute, MergeRecursive, appendBufferText } from './engine.js'
import { handleLists } from "./lists.js";
import { handleEntry } from "./entry.js";


let actions = {};


export function clearActions() {
    actions = {};
}


function getSortedActions() {

    const arr = Object.keys(actions).sort((a, b) => actions[a].priority - actions[b].priority); 
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


export function performAction(obj, page, story) {
    const buttons = document.querySelector("#btns");
    const [content, go, change] = [obj.content, obj.go, obj.change];
    buttons.innerHTML = '';
    actions = {};
    if (change) {
        MergeRecursive(story, change);
    }
    const nav = parsePathMarkup(go, page);
    if (nav && story[nav]) {
        if (content) {
            appendBufferText(content, page);
        }
        const newRoom = story[nav];
        handleLists(story);
        story.gameInfo['previous page'] = page['file name'];
        execute(newRoom);
    } else {
        handleLists(story);
        execute(page);
        execute(obj);
    }
}



function handleActions(page, story) {
    const obj = {};
    if (page.entry) {
        handleEntry(page, story);
    }
    if (page.buttons) {
        const buttons = [...page.buttons];
        for (const b of buttons) {
            const label = b?.label ?? undefined;
            const color = b?.color ?? '#111131';
            const icon = b?.icon ?? '';
            const priority = b?.priority ?? 5;
            const active = getActionActive(b, page, story);
            const action = () => {
                performAction(b, page, story);
            };
            if (label && active) {
                obj[label] = {
                   label: setSpecialIcon(label),
                   priority,
                   icon,
                   color,
                   action,
                }
            }
        }    
    }
    return obj;
}

