



function parseList(page, name, listContent, commands) {

    const indexKey = `${name} index`;
    const contentKey = name;
    let stop = false;
    let index = page[indexKey] ?? 0;
    if (commands.indexOf('reversed') > -1) {
        listContent = listContent.reverse();
    }
    if (commands.indexOf('shuffled') > -1) {
        listContent = shuffle(listContent);
    }
    if (commands.indexOf('stop') > -1) {
        stop = true;
    }
    const content = listContent[index] ?? '';
    page[contentKey] = content;
    if (index < (listContent.length - 1)) {
        if (!stop) {
            index += 1;
        } else {
            if (index > -1) {
                index += 1;
            }
        }
    } else {
        if (!stop) {
            index = 0;
        }    
    }
    page[indexKey] = index;

}


export function handleListStart(token, page, story) {
    let obj = '';
    let prop = '';
    if (token[0] === '.') {
        token = token.replace('.', '+');
    }
    if (token.indexOf('.') === -1) {
        obj = pageName;
        prop = token;
    } else {
        obj = token.split('.')[0] ?? undefined;
        prop = token.split('.')[1] ?? undefined;    
    }
    if (token[0] === '+') {
        token = token.replace('+', '.');
        obj = obj.replace('+', '.');
    }
    obj = parsePathMarkup(obj, page);
    for (const key in story[obj]) {
        if (key.indexOf('--') > -1) {
            const name = key.split('--')[0].trim();
            if (prop === name) {
                const indexKey = `${name} index`;
                story[obj][indexKey] = 0;
                return;
            }
        }
    }
    const indexKey = `${prop} index`;
    story[obj][indexKey] = 0;
}



export function handleLists(story) {
    for (const key in story) {
        const m = story[key];
        for (const subKey in m) {
            if (Array.isArray(m[subKey])) {
                if (subKey.indexOf('--') > -1) {
                    let [name, commands] = subKey.split('--');
                    name = name.trim();
                    commands = commands.trim();
                    if (commands.indexOf('list') > -1) {
                        const listContent = [...m[subKey]] ?? [];
                        parseList(story[key], name, listContent, commands);
                    }
                }
            }    
        }
    }
}


/**
 * Get a random ordered version of an array.
 * @param {Array} array Array to shuffle.
 * @returns {Array} Returns the same array in random order.
 */
function shuffle(array) {

    // fisher-yates shuffle
    let currentIndex = array.length,
    randomIndex

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
    ]
    }

    return array
}

export function parsePathMarkup(g, page) {
    if (g && g[0] === '.' && g[1] === '/') {
        const elements = page.name.split('/');
        elements.pop();
        const address = elements.join('/');
        g = g.replace('.' ,'');
        return address + g;
    }
    return g;
}


export function getListMarkup(page, name) {
    const addr = `${name} --`;
    for (const key in page) {
        if (key.indexOf(addr) === 0) {
            const commands = key.split('--').pop().trim();
            const listContent = page[key] ?? [];
            parseList(page, name, listContent, commands);
            console.log(page);
        }
    }
}

