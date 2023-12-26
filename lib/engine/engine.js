/// <reference lib="dom" />
import mustache from "./mustache.js";
import { handleAward, initializeAchievements } from "./achievements.js";
import { handleStyle } from "./style.js";
import { SmartyPants } from "./smartypants.js";
import { ProcessMarkdown } from "./mark.js";
import { handleIcons } from "./icons.js";


// these values must be serialized
let bufferText = '';
let achievementText = '';

// these values don't have to be saved
let story = {};



function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


export function appendBufferText(str, page) {
    bufferText += str;
    bufferText = handleTemplates(bufferText, page);
}


export function handleTemplates(s, page) {

    const matchSearch = s.matchAll(/\{\{.*\}\}/gm);
    if (matchSearch) {
        for (const m of matchSearch) {
            let text = m[0];
            const originalText = m[0];
            const toUpper = text.indexOf('^') > -1;
            if (toUpper) {
                text = text.replaceAll('^', '');
            }
            text = text.replaceAll('{{', '');
            text = text.replaceAll('}}', '');
            text = text.trim();
            if (text.indexOf('.') === -1) {
                const name = page["file name"];
                text = name + '.' + text;
            }
            let sub = mustache.render(`{{${text}}}`, story).trim();
            if (toUpper) {
                sub = capitalizeFirstLetter(sub);
            }
            s = s.replace(originalText, sub);
        }
    }
    return s;

}


function clearOutput() {
    const output = document.querySelector("#out");
    output.innerHTML = '';
}


export function displayContent(page) {
    const output = document.querySelector("#out");
    const state = page?.state ?? 'default';
    let s = ''
    if (state === 'default') {
        s = handleTemplates(page['content'], page);
    } else {
        if (page[state]['content']) {
            s = handleTemplates(page[state]['content'], page);
        } else {
            s = handleTemplates(page['content'], page);
        }
    }
    if (bufferText !== '') {
        s = `\n\n${bufferText}\n\n` + s;
        bufferText = '';
    }
    if (achievementText !== '') {
        s += achievementText;
        achievementText = '';
    }
    s = SmartyPants(s);
    s = ProcessMarkdown(s);
    output.innerHTML = s;
}


export function MergeRecursive(obj1, obj2) {
    for (const p in obj2) {
      try {
        if ( obj2[p].constructor == Object ) {
          obj1[p] = MergeRecursive(obj1[p], obj2[p]);
  
        } else {
          obj1[p] = obj2[p];
  
        }
  
      } catch (_e) {
        obj1[p] = obj2[p];
  
      }
    }
    return obj1;
}


export function execute(page) {
    
    clearOutput();
    if (page.award) {
        handleAward(page.award, story, t => achievementText += t);
    }
    if (page.content) {
        displayContent(page);
    }

}


export function navigate(page) {

    execute(page);
    handleIcons(page, story);

}


function showError(error) {
    const output = document.getElementById('out');
    output.append(error);
}


function restartStory() {
    
    const storyFile = stl;
    try {
        story = JSON.parse(storyFile);
    } catch (e) {
        showError(e);
        throw (e);
    }
    const debugMode = story['gameInfo']['debug'] ? true : false;
    if (debugMode) {
        const d = story['debug'] ?? {};
        MergeRecursive(story, d);
    }
    handleStyle(story);
    initializeAchievements(story);
    const firstPage = story['gameInfo']['start'];
    document.title = story['gameInfo']['title'];
    navigate(story[firstPage]);

}


export function run() {

    restartStory();

}

run();
