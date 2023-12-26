
import { showActions, performAction } from "./actions.js";
import { conditionCheck } from "./condition.js";


let expanded;


function getIconGraphic(icon) {

    const substitute = {
        'use': 'back_hand',
        'look': 'search',
        'nav': 'walk',
        'topic': 'chat'
    };    

    if (substitute[icon]) {
        icon = substitute[icon];
    }
    return `<span class="material-symbols-outlined iconSize">${icon}</span>`;
}


function getItemActive(item, page, story) {
    if (!item.active) {
        return true;
    } else {
        return [...item.active].filter(x => conditionCheck(x, page, story)).length > 0;
    }
}


function renderIcons(icons) {
    const buttons = document.querySelector("#btns");
    buttons.innerHTML = '';
    for (const icon of icons) {
        const btn = document.createElement('button');
        btn.innerHTML += icon.icon;
        btn.className = 'tileButton';
        btn.onclick = icon.expand;
        btn.alt = icon.icon;
        buttons.appendChild(btn);
    }
}


function handleCheck(callback, page, story) {
    const buttons = document.querySelector("#btns");
    const btn = document.createElement('button');
    btn.innerHTML = `<span class="material-symbols-outlined iconSize">check</span>`;
    btn.className = 'tileButton';
    btn.onclick = () => performAction(callback, page, story, () => {
        expanded = false;
        handleIcons(page, story);
    });
    btn.alt = 'check';
    buttons.appendChild(btn);
}


function process(category, page, story) {
    
    const items = {};
    const actionSet = {
        items: [],
        icon: getIconGraphic(category),
        expand: () => {
            expanded = category;
            handleIcons(page, story);
        }
    }
    for (const item of page[category]) {
        if (getItemActive(item, page, story)) {
            const key = item.text;
            if (!key) {
                throw `Item must have valid text!!`;
            }
            items[key] = item;
        }
    }
    for (const key in items) {
        actionSet.items.push(items[key]);
    }
    return actionSet;
    
}


export function handleIcons(page, story) {

    const result = {};
    const icons = [];
    const verbs = ['look', 'use', 'topic', 'nav'];
    verbs.map(verb => {
        if (page[verb]) {
            result[verb] = process(verb, page, story);
        }
    });

    if (!expanded) {
        verbs.map(verb => {
            if (result[verb]) {
                icons.push(result[verb]);
            }
        });
        renderIcons(icons);
        if (page.check) {
            handleCheck(page.check, page, story);
        }
    } else {
        showActions(result[expanded].items, page, story, () => {
            expanded = false;
            handleIcons(page, story);
        });
    }

}
