

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
    const reverse = token.indexOf('!') === 0 || token.indexOf('not ') === 0;
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


function handleClause(condition, page, story) {
    const isRegexCheck = /\((.*)\) is \((.*)\)/gm;
    const notRegexCheck = /\((.*)\) isn't \((.*)\)/gm;
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


export function conditionCheck(condition, page, story) {
    if (condition.indexOf(' and ') > -1) {
        const conditions = condition.split(' and ');
        const clauses = conditions.map(c => handleClause(c.trim(), page, story));
        return clauses.every(t => t === true);
    }
    return handleClause(condition.trim(), page, story);
}


