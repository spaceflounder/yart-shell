// deno-lint-ignore-file no-explicit-any
/// <reference lib="dom" />

import { clearActions } from "./actions.ts";
import { SmartyPants } from './smartypants.js';
import { ProcessMarkdown } from "./mark.js";
import { initializeAchievements } from "./achievements.ts";
import { renderChart } from "./mermaid.ts";
import { handleStyle } from "./style.ts";


let pageName = '';
let story: any = {};
let bufferText = '';
let achievementText = '';


function MergeRecursive(obj1: any, obj2: any) {
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



function showError(error: string) {
    const output = document.getElementById('out')!;
    output.append(error);
}



function clearOutput() {
    const output = document.querySelector("#out")!;
    output.innerHTML = '';
}


function displayMsg(page: any) {
    const output = document.querySelector("#out")!;
    const state = page?.state ?? 'default';
    let s = '';
    /*
    if (state === 'default') {
        s = handleTemplates(page['content'], page);
    } else {
        if (page[state]['content']) {
            s = handleTemplates(page[state]['content'], page);
        } else {
            s = handleTemplates(page['content'], page);
        }
    }
    */
    if (bufferText !== '') {
        s = `\n\n${bufferText}\n\n${s}`;
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


function execute(page: any) {
    if (!page) {
        page = story[pageName];
    }
    if (!page.content && !page.map) {
        throw `Error: Page not implemented yet!`;
    }
    if (page.inherits) {
        handleInherits(page);
    }
    clearOutput();
    if (page.start) {
        handleListStart(page.start);
    }
    if (page.award) {
        handleAward(page.award);
    }
    if (page.content) {
        displayMsg(page);
    }
    if (page.map) {
        const markup = page.map;
        renderChart(markup);
    }
    refreshActions(page);
}


export function run(storyFile: any) {
    
    clearActions();
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
    pageName = firstPage;
    execute(story[firstPage]);

}

